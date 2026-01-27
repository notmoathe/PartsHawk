# 🚨 CRITICAL: Env Vars are Incorrect

The keys you added (`sb_publishable_...`) appear to be **AccessToken** or **Management Tokens**, not the **API Keys** required for the app to work. The API keys are **JSON Web Tokens (JWTs)** and usually start with `eyJ...`.

## How to find the Correct Keys

1.  Go to your **Supabase Dashboard**.
2.  Open your project (`parts-hawk`).
3.  Click on **Settings** (Gear icon at the bottom left).
4.  Click on **API**.
5.  Look for the section **Project API keys**.
    *   **anon** `public`: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`. It will be a very long string starting with `eyJ...`.
    *   **service_role** `secret`: This is your `SUPABASE_SERVICE_ROLE_KEY`. It also starts with `eyJ...`.

## Update Vercel

1.  Go to **Vercel Project Settings > Environment Variables**.
2.  **Edit** `NEXT_PUBLIC_SUPABASE_ANON_KEY` and paste the correct `anon` key (starting with `eyJ`).
3.  **Edit** `SUPABASE_SERVICE_ROLE_KEY` and paste the correct `service_role` key (starting with `eyJ`).
4.  **Save** both.

## ⚡️ IMPORTANT: Redeploy

Updating the variables **DOES NOT** affect the current live site. You must trigger a redeploy:
1.  Go to the **Deployments** tab in Vercel.
2.  Click the **three dots** (...) next to the latest deployment.
3.  Select **Redeploy**.

## Personalize Emails

You asked to personalize Supabase emails. You must do this in the Supabase Dashboard:
1.  Go to **Authentication > Email Templates**.
2.  You can edit "Confirm Your Signup", "Reset Password", etc.
3.  Change the text to say "Welcome to Trace Motorsports" instead of the default.
