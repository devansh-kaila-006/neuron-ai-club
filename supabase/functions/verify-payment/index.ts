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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = (globalThis as any).Deno.env.get("SUPABASE_URL");
    const supabaseKey = (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const recaptchaSecret = (globalThis as any).Deno.env.get("RECAPTCHA_SECRET_KEY");
    const rzpSecret = (globalThis as any).Deno.env.get("RAZORPAY_SECRET");
    const rzpKeyId = (globalThis as any).Deno.env.get("RAZORPAY_KEY_ID") || "";
    const webhookSecret = (globalThis as any).Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const rawBody = await req.text();
    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    
    let body: any = {};
    try { body = JSON.parse(rawBody); } catch { }

    let paymentId = body.paymentId;
    let orderId = body.orderId;
    let signature = body.signature;
    let teamData: any = body.teamData || {};
    let userEmailFallback = "";

    // --- 1. WEBHOOK PAYLOAD PARSING ---
    if (rzpWebhookSignature) {
      // If it's a webhook, we ONLY care about captured payments
      if (body.event !== "payment.captured") {
        return new Response(JSON.stringify({ success: true, message: "Non-capture event ignored" }), { headers: corsHeaders });
      }

      const payment = body.payload?.payment?.entity;
      paymentId = payment?.id;
      orderId = payment?.order_id;
      userEmailFallback = payment?.email;

      // Robust Team Data Extraction from Notes
      if (payment?.notes?.teamData) {
        try {
          teamData = JSON.parse(payment.notes.teamData);
        } catch (e) {
          console.error("Neural Parse Error: teamData note is malformed or truncated.");
          // Fallback to individual notes if JSON fails
          teamData = {
            teamname: payment?.notes?.teamName || "Squad Alpha",
            leademail: payment?.notes?.leadEmail || userEmailFallback
          };
        }
      }
    }

    // --- 2. DUPLICATE CHECK ---
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

    // --- 3. MULTI-MODE AUTHENTICATION ---
    let isAuthorized = false;
    let authMethod = "None";

    if (rzpWebhookSignature && webhookSecret) {
      isAuthorized = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
      authMethod = "Webhook_HMAC";
    } 
    else if (paymentId && rzpSecret) {
      if (orderId && signature) {
        isAuthorized = await verifySignature(`${orderId}|${paymentId}`, signature, rzpSecret);
        authMethod = "Standard_HMAC";
      } 
      else if (rzpKeyId.startsWith('rzp_test_')) {
        isAuthorized = true; 
        authMethod = "Heuristic_Test_Verify";
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Cryptographic Integrity Failed", 
        method: authMethod 
      }), { status: 401, headers: corsHeaders });
    }

    // --- 4. RECORD CREATION ---
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const teamID = `TALOS-${array[0].toString(36).substring(0, 6).toUpperCase()}`;
    
    const fullTeam = {
      teamname: teamData?.teamname || "Squad Alpha",
      leademail: teamData?.leademail || userEmailFallback || "lead@talos.ai",
      members: teamData?.members || [],
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
      throw new Error(`Database Anchor Failure: ${error.message}`);
    }

    return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Internal Error:", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
})
