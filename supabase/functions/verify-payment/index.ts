
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// NEURØN Environment Bridge: Shim process.env for Deno runtime
const process = {
  // Fix: Access Deno through globalThis to resolve environment name resolution issues
  env: (globalThis as any).Deno.env.toObject()
};

/**
 * Verifies Razorpay Signature using HMAC-SHA256
 */
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
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    );

    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    const rawBody = await req.text();
    let orderId, paymentId, teamData;

    // WEBHOOK PATH (Automated Sync)
    if (rzpWebhookSignature) {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (!webhookSecret) throw new Error("Webhook Secret not configured.");

      // Security: Validate that the request actually came from Razorpay
      const isValid = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
      if (!isValid) throw new Error("Unauthorized Webhook Signature.");

      const payload = JSON.parse(rawBody);
      const payment = payload.payload.payment.entity;
      orderId = payment.order_id;
      paymentId = payment.id;
      teamData = JSON.parse(payment.notes?.teamData || "{}");
      
      console.log(`[Webhook]: Verified payment ${paymentId} for ${teamData.teamName}`);
    } 
    // CLIENT PATH (Instant Sync)
    else {
      const body = JSON.parse(rawBody);
      orderId = body.orderId;
      paymentId = body.paymentId;
      const clientSignature = body.signature;
      teamData = body.teamData;

      const rzpSecret = process.env.RAZORPAY_SECRET;
      if (!rzpSecret) throw new Error("Razorpay Secret not configured.");

      const isValid = await verifySignature(`${orderId}|${paymentId}`, clientSignature, rzpSecret);
      if (!isValid) throw new Error("Invalid Client Signature Sequence.");
    }

    // IDEMPOTENCY: Check if already registered
    const { data: existing } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('razorpayPaymentId', paymentId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, data: existing }), { headers: corsHeaders });
    }

    // GENERATE SECURE 6-DIGIT TALOS ID
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const teamID = `TALOS-${array[0].toString(36).substring(0, 6).toUpperCase()}`;
    
    const fullTeam = {
      ...teamData,
      id: crypto.randomUUID(),
      teamID,
      paymentStatus: 'paid',
      checkedIn: false,
      registeredAt: Date.now(),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId
    };

    // ATOMIC UPSERT: Handle race conditions between Webhook and Client
    const { data, error } = await supabaseAdmin
      .from('teams')
      .upsert(fullTeam, { onConflict: 'razorpayPaymentId' })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[Verify Error]:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
