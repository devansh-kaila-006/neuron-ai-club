# 🛡️ NEURØN Final Hardening TODO

To complete the security implementation, you must perform these manual steps in your Supabase and Vercel dashboards.

## 1. Eliminate Secret Exposure (CRITICAL)
The frontend code has been hardened to not require a local secret for verification. You must now remove the leaked secret from the browser bundle.

- [ ] **Vercel/Environment**: Remove `VITE_ADMIN_HASH`. 
- [ ] **Local `.env`**: Ensure `VITE_ADMIN_HASH` is deleted from any local developer environment.

## 2. Supabase Infrastructure Hardening
The application code now follows a **Fail-Closed** logic, but the database and network layers require manual adjustment.

- [ ] **SQL Editor**: Execute the following to fix **Broken Access Control** (Issue 1.1):
  ```sql
  -- Disable existing wide-open policies
  DROP POLICY IF EXISTS "Allow public update access" ON teams;
  DROP POLICY IF EXISTS "Allow public insert access" ON teams;

  -- Enable RLS
  ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

  -- 1. Restrict INSERT and UPDATE to the backend Service Role only
  -- This ensures only your Edge Functions (which verify signatures) can change data.
  CREATE POLICY "Enable updates for service role only" ON teams 
  FOR UPDATE TO service_role USING (true);

  CREATE POLICY "Enable inserts for service role only" ON teams 
  FOR INSERT TO service_role WITH CHECK (true);

  -- 2. Keep Public Read for lookups
  CREATE POLICY "Allow public read access" ON teams FOR SELECT USING (true);
  ```

## 3. Rate Limiting & Denial of Wallet
To prevent Issue 2.4 (Denial of Service), configure request throttling.

- [ ] **Supabase Settings**: Go to *Settings > API*. Ensure the "Rate Limiting" toggle is active.
- [ ] **Custom Middleware**: If traffic spikes, consider implementing an IP-based throttle in your `neural-chat` Edge Function using a Redis provider like Upstash.

## 4. Verification Check
- [ ] **Test Login**: Log in to the Admin Terminal with the *wrong* password. The UI should let you in (as it no longer stores the hash), but it should immediately show a **"Session De-authorized"** error and kick you back to the login screen as soon as it tries to fetch data. This confirms the server-side verification is active.

---
*Status: Codebase Hardened. Infrastructure Action Required.*