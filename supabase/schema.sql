-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- HAWKS: The monitoring rules
create table public.hawks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  keywords text not null,
  negative_keywords text,
  max_price numeric not null,
  condition text, -- 'new', 'used', 'parts'
  source text default 'ebay', -- 'ebay', 'facebook', 'craigslist'
  status text default 'active', -- 'active', 'paused'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FOUND LISTINGS: Fingerprints to prevent duplicate alerts
create table public.found_listings (
  id uuid default gen_random_uuid() primary key,
  hawk_id uuid references public.hawks not null,
  listing_id text not null, -- eBay Item ID
  title text not null,
  price numeric not null,
  url text not null,
  image_url text,
  found_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(hawk_id, listing_id)
);

-- NOTIFICATIONS: Audit log of alerts sent
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  hawk_id uuid references public.hawks,
  listing_id text,
  message text,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Basic)
alter table public.hawks enable row level security;
create policy "Users can only see their own hawks" on public.hawks for select using (auth.uid() = user_id);
create policy "Users can insert their own hawks" on public.hawks for insert with check (auth.uid() = user_id);
