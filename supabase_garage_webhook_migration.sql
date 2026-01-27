-- Migration: Add Vehicle Info and Webhook URL to Hawks

alter table hawks 
add column if not exists vehicle_string text, -- e.g. "2005 Mazda Miata"
add column if not exists webhook_url text;    -- Discord/Slack Webhook URL

-- No RLS changes needed as existing policies cover the whole row.
