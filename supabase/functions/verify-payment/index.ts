
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
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
}

async function verifySignature(data: string, signature: string, secret: string) {
  try {
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
  } catch (err) {
    console.error("Signature Crypto Error:", err);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = (globalThis as any).Deno.env.get("SUPABASE_URL");
    const supabaseKey = (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const recaptchaSecret = (globalThis as any).Deno.env.get("RECAPTCHA_SECRET_KEY");
    const rzpSecret = (globalThis as any).Deno.env.get("RAZORPAY_SECRET");
    const rzpKeyId = (globalThis as any).Deno.env.get("RAZORPAY_KEY_ID") || "";
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const rawBody = await req.text();
    let body: any = {};
    try { body = JSON.parse(rawBody); } catch { }

    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    let captchaToken = body.captchaToken;

    // --- 1. CONFIGURATION CHECK ---
    if (!rzpSecret && !rzpWebhookSignature) {
      console.error("NEURØN CRITICAL: RAZORPAY_SECRET is missing.");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Neural Link Configuration Failure",
        details: "Razorpay secret is missing in the backend environment."
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- 2. reCAPTCHA VERIFICATION ---
    let captchaScore = 0;
    if (!rzpWebhookSignature) {
      if (captchaToken) {
        try {
          const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaToken}`, { method: 'POST' });
          const verifyData = await verifyRes.json();
          captchaScore = verifyData.score || 0;
          console.log(`reCAPTCHA sync: score=${captchaScore}, success=${verifyData.success}`);
        } catch (err) {
          console.warn("reCAPTCHA Node unreachable, using integrity fallback.");
          captchaScore = 0.5; // Neutral fallback
        }
      } else {
        console.warn("Manual Sync detected without reCAPTCHA token.");
      }
    }

    let paymentId = body.paymentId;
    let orderId = body.orderId;
    let signature = body.signature;
    let teamData = body.teamData || {};

    // Webhook parsing if applicable
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

    // Duplicate Check: Return existing record if payment was already verified
    if (paymentId) {
      const { data: existing } = await supabaseAdmin
        .from('teams')
        .select('*')
        .eq('razorpaypaymentid', paymentId)
        .maybeSingle();

      if (existing) {
        console.log(`Duplicate verify ignored: ${paymentId} already anchored.`);
        return new Response(JSON.stringify({ success: true, data: existing }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const webhookSecret = (globalThis as any).Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    let isAuthorized = false;
    let authMethod = "None";

    // --- 3. MULTI-MODE AUTHENTICATION ---
    
    // Mode A: Webhook Signature
    if (rzpWebhookSignature && webhookSecret) {
      isAuthorized = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
      authMethod = "Webhook_HMAC";
    } 
    // Mode B: Client-side Signature (Standard Flow)
    else if (paymentId && rzpSecret) {
      if (orderId && signature) {
        isAuthorized = await verifySignature(`${orderId}|${paymentId}`, signature, rzpSecret);
        authMethod = "Standard_HMAC";
      } 
      // Mode C: Test Mode / Fallback (High Captcha Score + Test Key)
      else if (rzpKeyId.startsWith('rzp_test_') || captchaScore >= 0.7) {
        console.warn(`Soft-verifying payment ${paymentId} (Test Mode / High Score)`);
        isAuthorized = true; 
        authMethod = "Heuristic_Verify";
      }
    }

    if (!isAuthorized) {
      console.error(`AUTH REJECTED: ${paymentId} failed ${authMethod}. Score: ${captchaScore}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: "Neural Sequence Rejected: Cryptographic Integrity Failed.",
        details: "The signature provided by the gateway does not match the local security key. Check your RAZORPAY_SECRET."
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- 4. RECORD CREATION & GRID ANCHORING ---
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
      console.error("Grid Database Error:", error.message);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Database Anchor Failure", 
        details: error.message 
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Successfully anchored squad: ${fullTeam.teamid}`);
    return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Internal Verification Error:", error.message);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Internal Neural Verification Error", 
      details: error.message 
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})
