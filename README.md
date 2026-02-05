
# 🧠 NEURØN | Production Ops Manual

This guide outlines the protocol for deploying the NEURØN Hub and TALOS 2026 registration grid.

## 1. Supabase Backend Setup

### A. Database Initialization
Run this in your **Supabase SQL Editor**:
```sql
-- 1. Create the Manifest Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teamName TEXT NOT NULL,
  teamID TEXT NOT NULL UNIQUE,
  members JSONB NOT NULL,
  leadEmail TEXT NOT NULL,
  paymentStatus TEXT NOT NULL DEFAULT 'pending',
  razorpayOrderId TEXT UNIQUE,
  razorpayPaymentId TEXT UNIQUE, -- CRITICAL: Unique for idempotency
  checkedIn BOOLEAN DEFAULT FALSE,
  registeredAt BIGINT NOT NULL
);

-- 2. Add Index for high-speed lookups
CREATE INDEX IF NOT EXISTS idx_team_id ON teams(teamID);
CREATE INDEX IF NOT EXISTS idx_team_payment_status ON teams(paymentStatus);
```

### B. Database Policies (RLS)
Security is paramount. Execute these to enable Row Level Security and allow the frontend to interact with the grid safely.

```sql
-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 1. Allow Public Read Access
-- Required for checking squad name availability and manifest lookups.
CREATE POLICY "Allow public read access" ON teams FOR SELECT USING (true);

-- 2. Allow Public Insert/Update
-- Required for the frontend to synchronize manifest drafts and check-ins.
-- Note: Sensitive fields (Payment Status) are verified/overwritten by Service Role functions.
CREATE POLICY "Allow public insert access" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON teams FOR UPDATE USING (true);

-- 3. Service Role (Bypass RLS)
-- Edge functions using the SERVICE_ROLE_KEY bypass these policies automatically.
```

### C. Deploy Edge Functions
Requires [Supabase CLI](https://supabase.com/docs/guides/cli).
```bash
# 1. Login & Link
supabase login
supabase link --project-ref your-project-id

# 2. Deploy Functions
supabase functions deploy neural-chat --no-verify-jwt
supabase functions deploy verify-payment --no-verify-jwt
supabase functions deploy send-manifest --no-verify-jwt
```

### D. Configure Secrets (CRITICAL)
Set these variables in your **Supabase Settings > Edge Functions > Secrets**:
```bash
# Gemini AI (Input 4 keys separated by commas for 429 rotation)
# Uses Gemini 2.5 Flash-Lite
supabase secrets set GEMINI_API_KEYS="key1,key2,key3,key4"

# Razorpay (Use Live keys for production)
supabase secrets set RAZORPAY_SECRET=your_razorpay_secret
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_dashboard

# Resend (Input multiple keys separated by commas for the surge)
supabase secrets set RESEND_API_KEYS="re_key1,re_key2"

# Admin Access (SHA-256 of your password)
supabase secrets set ADMIN_HASH=your_password_hash
```

## 2. Razorpay Webhook Configuration

1.  Go to **Razorpay Dashboard > Settings > Webhooks**.
2.  **Webhook URL**: `https://your-project-id.supabase.co/functions/v1/verify-payment`
3.  **Secret**: Use the same string you set in `RAZORPAY_WEBHOOK_SECRET`.
4.  **Active Events**: Select `payment.captured`.
5.  **Save**: This ensures registrations are anchored even if the user closes their browser post-payment.

## 3. Vercel Frontend Configuration

Add these to your **Vercel Project Settings > Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Project URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your `anon` `public` key | Found in API Settings |
| `VITE_RAZORPAY_KEY_ID` | Your Razorpay Key ID | `rzp_live_...` |
| `VITE_ADMIN_HASH` | SHA-256 Password Hash | Matches Supabase secret |

## 4. Maintenance Ops
- **Log Monitoring**: Use `supabase functions logs verify-payment --follow` to watch registration pulses in real-time.
- **Data Export**: Use the "Export CSV" button in the Admin Terminal for manifest handovers.
- **Check-in**: Use the Admin QR Scanner or manual "Verify" toggle. It pulls directly from the live PostgreSQL manifest.
