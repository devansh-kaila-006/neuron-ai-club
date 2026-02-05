
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
CREATE POLICY "Allow public read access" ON teams FOR SELECT USING (true);

-- 2. Allow Public Insert/Update
CREATE POLICY "Allow public insert access" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON teams FOR UPDATE USING (true);
```

### C. Deploy Edge Functions
```bash
supabase functions deploy neural-chat --no-verify-jwt
supabase functions deploy verify-payment --no-verify-jwt
supabase functions deploy send-manifest --no-verify-jwt
```

### D. Configure Secrets (HIGH AVAILABILITY)
Set these in **Supabase Settings > Edge Functions > Secrets**:

```bash
# Gemini AI (Input 4 keys separated by commas for 60 RPM throughput)
# Model: Gemini 2.5 Flash-Lite
supabase secrets set API_KEY="key1,key2,key3,key4"

# Resend (Input 4 keys separated by commas for 400+ registration surge)
supabase secrets set RESEND_API_KEYS="re_key1,re_key2,re_key3,re_key4"

# Razorpay (Live Keys)
supabase secrets set RAZORPAY_SECRET=your_secret
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Admin Terminal
supabase secrets set ADMIN_HASH=sha256_hash_of_password
```

## 2. Vercel Frontend Configuration

Add these to your **Vercel Environment Variables**:

| Variable | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Public Key |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_...` |
| `VITE_ADMIN_HASH` | Matches Supabase secret |

## 3. Maintenance
- **RPM Check**: With 4 keys, `neural-chat` supports ~60 RPM.
- **Surge Check**: With 4 Resend keys, `send-manifest` handles roughly 400 emails/day on free tier or unlimited on paid.
- **Purge**: Use the "Purge Manifest" button in Admin for end-of-event cleanups.
