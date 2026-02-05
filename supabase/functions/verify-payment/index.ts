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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const supabaseAdmin = createClient(
      (globalThis as any).Deno.env.get("SUPABASE_URL") ?? '',
      (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
    );

    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    const rawBody = await req.text();
    let orderId, paymentId, teamData;

    if (rzpWebhookSignature) {
      const webhookSecret = (globalThis as any).Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
      if (!webhookSecret) throw new Error("Manifest Integrity Error: Webhook Secret missing.");
      
      const isValid = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
      if (!isValid) throw new Error("Security Violation: Unauthorized Webhook Signature.");

      const payload = JSON.parse(rawBody);
      const payment = payload.payload.payment.entity;
      orderId = payment.order_id;
      paymentId = payment.id;
      
      try {
        // Use consistent mapping for webhook
        teamData = payment.notes?.teamData ? JSON.parse(payment.notes.teamData) : {
          teamname: payment.notes?.teamName,
          leademail: payment.notes?.leadEmail
        };
      } catch {
        teamData = { teamname: payment.notes?.teamName, leademail: payment.notes?.leadEmail };
      }
    } else {
      const body = JSON.parse(rawBody);
      orderId = body.orderId;
      paymentId = body.paymentId;
      const clientSignature = body.signature;
      teamData = body.teamData;

      if (orderId && clientSignature) {
        const rzpSecret = (globalThis as any).Deno.env.get("RAZORPAY_SECRET");
        if (!rzpSecret) throw new Error("Manifest Integrity Error: Secret Key missing.");
        const isValid = await verifySignature(`${orderId}|${paymentId}`, clientSignature, rzpSecret);
        if (!isValid) throw new Error("Security Violation: Invalid Client Signature.");
      }
    }

    if (!paymentId) throw new Error("Manifest Error: Missing Payment ID.");

    // Idempotency check with lowercase column
    const { data: existing } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('razorpaypaymentid', paymentId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, data: existing }), { headers: corsHeaders });
    }

    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const teamID = `TALOS-${array[0].toString(36).substring(0, 6).toUpperCase()}`;
    
    // Construct object matching Supabase lowercase columns exactly
    const fullTeam = {
      teamname: teamData.teamname || teamData.teamName,
      leademail: teamData.leademail || teamData.leadEmail,
      members: teamData.members,
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

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[Neural Verify Error]:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})