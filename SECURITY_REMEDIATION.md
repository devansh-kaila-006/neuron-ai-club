# 🛡️ NEURØN Security Remediation Guide

This manifest contains manual steps required to finalize the security hardening of the TALOS registration grid. 

## 1. Supabase Row Level Security (CRITICAL)
Your current database policies allow **public update** access. This allows any user to manually change their `paymentstatus` via the REST API.

**Execute this in the Supabase SQL Editor immediately:**

```sql
-- 1. Disable existing insecure policies
DROP POLICY IF EXISTS "Allow public update access" ON teams;
DROP POLICY IF EXISTS "Allow public insert access" ON teams;

-- 2. Restrict INSERT and UPDATE to the backend Service Role only
-- This ensures only your Edge Functions (which verify signatures) can change data.
CREATE POLICY "Allow Service Role Update" ON teams 
FOR UPDATE TO service_role USING (true);

CREATE POLICY "Allow Service Role Insert" ON teams 
FOR INSERT TO service_role WITH CHECK (true);

-- 3. Maintain public SELECT for lookups (safe if IDs are UUIDs)
-- Keep this policy as is
```

## 2. API Key Stewardship
- **VITE_ Prefixes**: Remember that any variable starting with `VITE_` is bundled into your frontend and is **visible to anyone** using Browser DevTools.
- **ADMIN_HASH**: The client-side derivation is now used as a session key. Ensure `VITE_ADMIN_HASH` is set correctly in Vercel.

## 3. Edge Function Authorization
The code now sends an `x-neural-auth` header. For this to work, you must ensure your Edge Function environment has the `ADMIN_HASH` secret set:

```bash
supabase secrets set ADMIN_HASH="your_sha256_password_hash"
```

## 4. Periodic Audits
- **Purge Schedule**: Manually verify the "Purge Manifest" function in the Admin Terminal after the event concludes to remove PII from the cloud.
- **Resend Logs**: Check Resend.com dashboard for any rejected emails which might indicate an API key rotation failure.

---
*Assessor: NEURØN Synthetic Security Unit*