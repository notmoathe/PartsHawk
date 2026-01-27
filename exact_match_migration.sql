-- Add exact_match column to hawks table
alter table hawks
add column if not exists exact_match boolean default false;
