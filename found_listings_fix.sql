-- Migration: Add user_id to found_listings for robust RLS

-- 1. Add column
alter table found_listings 
add column if not exists user_id uuid references auth.users;

-- 2. Backfill user_id from existing hawks (Best effort for existing data)
update found_listings
set user_id = hawks.user_id
from hawks
where found_listings.hawk_id = hawks.id
and found_listings.user_id is null;

-- 3. Update RLS Policies
-- Drop old complex policies
drop policy if exists "Users can view own found listings" on found_listings;
drop policy if exists "Users can insert found listings" on found_listings;

-- Create new simple policies
create policy "Users can view own found listings" on found_listings
  for select using (auth.uid() = user_id);

create policy "Users can insert found listings" on found_listings
  for insert with check (auth.uid() = user_id);

-- Also allow Service Role (which bypasses RLS anyway, but good for clarity) to do anything.
