-- Add region column to hawks table
ALTER TABLE hawks 
ADD COLUMN region text DEFAULT 'us';

-- Comment on column
COMMENT ON COLUMN hawks.region IS 'Geographic region for search (e.g. west, midwest, northeast, south, all)';
