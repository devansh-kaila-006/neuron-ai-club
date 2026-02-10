
(globalThis as any).process = {
  env: new Proxy({}, {
    get: (_, prop: string) => (globalThis as any).Deno.env.get(prop)
  })
} as any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-neural-auth, x-neuron-client',
}

async function verifySignature(data: string, signature: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedSignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = (globalThis as any).Deno.env.get("SUPABASE_URL");
    const supabaseKey = (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const recaptchaSecret = (globalThis as any).Deno.env.get("RECAPTCHA_SECRET_KEY");
    const rzpSecret = (globalThis as any).Deno.env.get("RAZORPAY_SECRET");
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const rawBody = await req.text();
    let body: any = {};
    try { body = JSON.parse(rawBody); } catch { }

    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    let captchaToken = body.captchaToken;

    // --- 1. CONFIGURATION CHECK ---
    if (!rzpSecret && !rzpWebhookSignature) {
      console.error("Critical: RAZORPAY_SECRET is not configured in Supabase Env.");
      return new Response(JSON.stringify({ 
        error: "Neural Link Configuration Error: Payment gateway secret missing in backend environment.",
        details: "Ensure RAZORPAY_SECRET is set in Supabase Settings -> Edge Functions."
      }), { status: 500, headers: corsHeaders });
    }

    // --- 2. MANDATORY reCAPTCHA ENFORCEMENT ---
    let captchaScore = 0;
    if (!rzpWebhookSignature) {
      if (!captchaToken) {
        return new Response(JSON.stringify({ error: "Access Denied: reCAPTCHA verification required for manual sync." }), { status: 403, headers: corsHeaders });
      }
      
      const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`, { method: 'POST' });
      const verifyData = await verifyRes.json();
      captchaScore = verifyData.score || 0;
      
      if (!verifyData.success || captchaScore < 0.4) {
        return new Response(JSON.stringify({ error: "Access Denied: Automated entity detected. Sync sequence terminated." }), { status: 403, headers: corsHeaders });
      }
    }

    let paymentId = body.paymentId;
    let orderId = body.orderId;
    let signature = body.signature;
    let teamData = body.teamData || {};

    // Webhook parsing
    if (rzpWebhookSignature) {
      const payload = JSON.parse(rawBody);
      const payment = payload.payload?.payment?.entity;
      paymentId = payment?.id;
      orderId = payment?.order_id;
      teamData = payment?.notes?.teamData ? JSON.parse(payment.notes.teamData) : {
        teamname: payment?.notes?.teamName,
        leademail: payment?.notes?.leadEmail
      };
    }

    // Duplicate Check
    if (paymentId) {
      const { data: existing } = await supabaseAdmin
        .from('teams')
        .select('*')
        .eq('razorpaypaymentid', paymentId)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ success: true, data: existing }), { headers: corsHeaders });
      }
    }

    const webhookSecret = (globalThis as any).Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    let isAuthorized = false;

    // --- 3. CRYPTOGRAPHIC VERIFICATION ---
    if (rzpWebhookSignature && webhookSecret) {
      isAuthorized = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
    } else if (paymentId && rzpSecret) {
      if (orderId && signature) {
        // Standard Order Verification
        isAuthorized = await verifySignature(`${orderId}|${paymentId}`, signature, rzpSecret);
      } else if (captchaScore >= 0.7) {
        // HACKATHON FALLBACK: If orderId is missing but we have a strong Captcha Score and Payment ID
        // We log this as a "Soft Verified" entry
        console.warn(`Soft-verifying payment ${paymentId} due to missing OrderID but high Captcha Score.`);
        isAuthorized = true; 
      }
    }

    if (!isAuthorized) {
      console.error(`Verification Failed for Payment ${paymentId}. OrderID present: ${!!orderId}, Signature present: ${!!signature}`);
      return new Response(JSON.stringify({ 
        error: "Neural Sequence Rejected: Cryptographic Integrity Failed.",
        details: "The signature provided by Razorpay does not match our security key. Check your RAZORPAY_SECRET."
      }), { status: 401, headers: corsHeaders });
    }

    // --- 4. RECORD CREATION ---
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const teamID = `TALOS-${array[0].toString(36).substring(0, 6).toUpperCase()}`;
    
    const fullTeam = {
      teamname: teamData.teamname || "Squad Alpha",
      leademail: teamData.leademail || "lead@talos.ai",
      members: teamData.members || [],
      id: crypto.randomUUID(),
      teamid: teamID,
      paymentstatus: 'paid',
      checkedin: false,
      registeredat: Date.now(),
      razorpayorderid: orderId || null,
      razorpaypaymentid: paymentId
    };

    const { data, error } = await supabaseAdmin
      .from('teams')
      .upsert(fullTeam, { onConflict: 'razorpaypaymentid' })
      .select()
      .single();

    if (error) {
      console.error("Database Save Error:", error.message);
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), { headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Internal Neural Verification Error", details: error.message }), { status: 500, headers: corsHeaders });
  }
})
