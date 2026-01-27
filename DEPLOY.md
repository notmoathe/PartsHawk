# How to Deploy PartHawk to Vercel

## Prerequisites
1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Account**: You'll need to push your code here.
3.  **Supabase Project**: You need your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

## Step 1: Push to GitHub
Since you are on Windows, you can use GitHub Desktop or the command line.

**Command Line:**
```bash
git init
git add .
git commit -m "Initial commit"
# Create a new repo on GitHub.com and copy the URL
git remote add origin https://github.com/notmoathe/PartsHawk.git
git push -u origin main
```

## Step 2: Import into Vercel
1.  Go to your Vercel Dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `PartHawk` repository.
4.  **Framework Preset**: Select `Next.js`.
5.  **Environment Variables**:
    *   Add `NEXT_PUBLIC_SUPABASE_URL`: (Your Project URL)
    *   Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Use the **Publishable Key** (starts with `sb_publishable_...`).
    *   Add `SUPABASE_SERVICE_ROLE_KEY`: Use the **Secret Key** (starts with `sb_secret_...`).

6.  **Root Directory**: Leave this as the default (e.g., `./` or `PartHawk`). Do NOT select `app` or `components`.
7.  Click **Deploy**.

## Step 3: Verify Deployment
Vercel will build your project. Once done, it will give you a live URL (e.g., `parthawk.vercel.app`).
Visit the URL and try adding a Hawk!

## Note on Scraper
I have optimized the scraper to use minimal Chromium (`@sparticuz/chromium-min`) which fits within Vercel's serverless limits. It will automatically switch to this mode when running on Vercel.
