
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    let orderId, paymentId, signature, teamData;
    const authHeader = req.headers.get('x-razorpay-signature');

    // WEBHOOK PATH (Razorpay calling us)
    if (authHeader) {
      const payload = await req.json();
      const payment = payload.payload.payment.entity;
      orderId = payment.order_id;
      paymentId = payment.id;
      // Extract teamData from Razorpay Notes
      teamData = JSON.parse(payment.notes?.teamData || "{}");
      
      console.log(`[Webhook Event]: Processing payment ${paymentId} for ${teamData.teamName}`);
    } 
    // CLIENT PATH (Browser calling us)
    else {
      const body = await req.json();
      orderId = body.orderId;
      paymentId = body.paymentId;
      signature = body.signature;
      teamData = body.teamData;

      const secret = process.env.RAZORPAY_SECRET;
      if (!secret) throw new Error('RAZORPAY_SECRET not configured.');

      // HMAC Verification for client calls
      const data = orderId + "|" + paymentId;
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

      if (signature !== expectedSignature) {
        throw new Error("Invalid Signature Sequence");
      }
    }

    // IDEMPOTENCY CHECK: Is this payment already recorded?
    const { data: existing } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('razorpayPaymentId', paymentId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, data: existing }), { headers: corsHeaders });
    }

    // GENERATE SECURE 6-DIGIT TEAM ID
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

    // UPSERT: Handles race conditions between Webhook and Client
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
