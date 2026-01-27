-- Add scan_interval and last_scanned_at to hawks table
ALTER TABLE hawks 
ADD COLUMN IF NOT EXISTS scan_interval INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP WITH TIME ZONE;

-- Add comment explaining columns
COMMENT ON COLUMN hawks.scan_interval IS 'Scan frequency in minutes';
COMMENT ON COLUMN hawks.last_scanned_at IS 'Timestamp of the last successful scan';
