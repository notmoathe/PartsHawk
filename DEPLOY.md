# PartHawk (Trace Motorsports) - Deployment Guide

## 1. Environment Variables
Add these to your Vercel Project Settings:

### Supabase (Database)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Anonymous Key (Client-side)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Service Role Key (Backend/Cron - **Keep Secret!**)

### Email (Notifications)
- `RESEND_API_KEY`: API Key from Resend.com

### eBay (Required for eBay Scraping)
- `EBAY_APP_ID`: Client ID from eBay Developer Portal
- `EBAY_APP_SECRET`: Client Secret from eBay Developer Portal
*(If these are missing, eBay scraping will just return 0 items and log an error)*

## 2. Database Migrations
Ensure you have run the following SQL migrations in your Supabase Dashboard:

1. **Found Listings**: `found_listings_fix.sql` (Schema setup)
2. **Soft Delete**: `soft_delete_migration.sql` (Archive functionality)
3. **Exact Match**: `exact_match_migration.sql` (Filtering)
4. **Scan Interval**: `supabase_interval_migration.sql` (Plan tiers)
5. **Webhooks**: `supabase_garage_webhook_migration.sql` (Discord hooks)
6. **Regions**: `region_migration.sql` (Location filtering)

## 3. Deployment Steps (Vercel)
1. Push code to GitHub `main` branch.
2. Vercel will auto-build.
3. Verify "Build Logs" show no errors.
4. Go to **Settings > Functions** and ensure Region is set (e.g., `us-east-1`).
5. Go to **Settings > Cron Jobs** to verify the scheduled job `app/api/cron/route.ts` is detected.

## 4. Verification
After deployment:
1. Visit your dashboard at `https://your-domain.com/dashboard`.
2. Create a test Hawk (e.g., "Honda Civic" on "Craigslist - West").
3. Wait 1-2 minutes or manually trigger the cron via `https://your-domain.com/api/cron?force=true` (you can inspect logs in Vercel).
