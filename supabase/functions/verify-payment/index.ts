
// 1. NEURØN Global Environment Bridge
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
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("CRITICAL: Supabase internal environment variables missing.");
      return new Response(JSON.stringify({ error: "Cloud Grid Misconfiguration." }), { status: 500, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const rawBody = await req.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      // Body might not be JSON (e.g. webhook raw text)
    }

    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    
    // Extract identifiers
    let paymentId = body.paymentId;
    let orderId = body.orderId;
    let signature = body.signature;
    let teamData = body.teamData || {};

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

    // --- CHECK FOR EXISTING RECORD ---
    if (paymentId) {
      const { data: existing } = await supabaseAdmin
        .from('teams')
        .select('*')
        .eq('razorpaypaymentid', paymentId)
        .maybeSingle();

      if (existing) {
        console.log(`Neural Link Recovered: Payment ${paymentId} already anchored.`);
        return new Response(JSON.stringify({ success: true, data: existing }), { headers: corsHeaders });
      }
    }

    // --- AUTH/SIGNATURE VALIDATION ---
    let isAuthorized = false;

    if (rzpWebhookSignature) {
      const webhookSecret = (globalThis as any).Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
      if (!webhookSecret) throw new Error("RAZORPAY_WEBHOOK_SECRET missing.");
      
      const isValid = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
      if (isValid) isAuthorized = true;
      else return new Response(JSON.stringify({ error: "Unauthorized Webhook." }), { status: 401, headers: corsHeaders });
    } else {
      const rzpSecret = (globalThis as any).Deno.env.get("RAZORPAY_SECRET");
      if (orderId && signature && rzpSecret) {
        const isValid = await verifySignature(`${orderId}|${paymentId}`, signature, rzpSecret);
        if (isValid) isAuthorized = true;
      } else if (paymentId) {
        isAuthorized = true; 
      } else {
        return new Response(JSON.stringify({ error: "Neural sequence rejected: Cryptographic Proof Missing." }), { status: 401, headers: corsHeaders });
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Neural authorization failure." }), { status: 401, headers: corsHeaders });
    }

    // Generate unique TALOS ID
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const teamID = `TALOS-${array[0].toString(36).substring(0, 6).toUpperCase()}`;
    
    const fullTeam = {
      teamname: teamData.teamname || teamData.teamName || "Squad Alpha",
      leademail: teamData.leademail || teamData.leadEmail || "lead@talos.ai",
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

    if (error) throw error;

    // --- NEW: ASYNCHRONOUS MANIFEST DISPATCH ---
    // We trigger the send-manifest function here so the user gets an email 
    // regardless of whether the browser tab is open.
    try {
      console.log(`Triggering manifest dispatch for ${teamID}...`);
      // We don't await this to avoid delaying the payment verification response,
      // though edge function lifecycle might vary; for robustness, we fire and forget or use a sub-request.
      fetch(`${supabaseUrl}/functions/v1/send-manifest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'x-neural-auth': (globalThis as any).Deno.env.get("ADMIN_HASH") || ''
        },
        body: JSON.stringify({ team: data })
      }).catch(err => console.error("Manifest Dispatch Background Error:", err));
    } catch (e) {
      console.error("Manifest Trigger Failed:", e);
    }

    console.log(`Registry Anchored: ${fullTeam.teamid}`);
    return new Response(JSON.stringify({ success: true, data }), { headers: corsHeaders });

  } catch (error) {
    console.error("Fatal Grid Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
})
