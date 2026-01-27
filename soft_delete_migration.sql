-- Add is_dismissed column for Soft Delete logic
ALTER TABLE found_listings ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN DEFAULT FALSE;

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_found_listings_dismissed ON found_listings(is_dismissed);

-- FIX: Enable RLS Policies for Deleting/Updating Listings
-- (Previously missing, which caused deletions to fail silently)

create policy "Users can update own found listings" on found_listings
  for update using (
    exists (
      select 1 from hawks
      where hawks.id = found_listings.hawk_id
      and hawks.user_id = auth.uid()
    )
  );

create policy "Users can delete own found listings" on found_listings
  for delete using (
    exists (
      select 1 from hawks
      where hawks.id = found_listings.hawk_id
      and hawks.user_id = auth.uid()
    )
  );
