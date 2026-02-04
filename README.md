
# 🧠 NEURØN | Production Ops Manual

This guide outlines the protocol for deploying the NEURØN Hub and TALOS 2026 registration grid.

## 1. Supabase Backend Setup

### A. Database Initialization
Run this in your **Supabase SQL Editor**:
```sql
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teamName TEXT NOT NULL,
  teamID TEXT NOT NULL UNIQUE,
  members JSONB NOT NULL,
  leadEmail TEXT NOT NULL,
  paymentStatus TEXT NOT NULL DEFAULT 'pending',
  razorpayOrderId TEXT UNIQUE,
  razorpayPaymentId TEXT UNIQUE,
  checkedIn BOOLEAN DEFAULT FALSE,
  registeredAt BIGINT NOT NULL
);

-- Add Index for fast lookups during check-in
CREATE INDEX IF NOT EXISTS idx_team_id ON teams(teamID);
```

### B. Deploy Edge Functions
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

### C. Configure Secrets (CRITICAL)
Set these variables in your **Supabase Settings > Edge Functions > Secrets**:
```bash
# Gemini AI
supabase secrets set API_KEY=your_gemini_key

# Razorpay (Use Live keys for production)
supabase secrets set RAZORPAY_SECRET=your_razorpay_secret
supabase secrets set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_dashboard

# Resend (Input all 4 keys separated by commas for the 400+ surge)
supabase secrets set RESEND_API_KEYS="re_key1,re_key2,re_key3,re_key4"

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

| Variable | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase `anon` `public` key |
| `VITE_RAZORPAY_KEY_ID` | Your Razorpay Key ID (`rzp_live_...`) |
| `VITE_ADMIN_HASH` | The same SHA-256 hash used in Supabase |

## 4. Maintenance Ops
- **Log Monitoring**: Use `supabase functions logs verify-payment --follow` to watch registration pulses in real-time.
- **Check-in**: Use the Admin QR Scanner. It pulls directly from the live PostgreSQL manifest.
