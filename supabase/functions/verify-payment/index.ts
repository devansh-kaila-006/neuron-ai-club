
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
    const supabaseAdmin = createClient(
      (globalThis as any).Deno.env.get("SUPABASE_URL") ?? '',
      (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ''
    );

    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    const clientAuth = req.headers.get('x-neural-auth');
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    
    const rawBody = await req.text();
    let orderId, paymentId, teamData, signature;

    if (rzpWebhookSignature) {
      // WEBHOOK PATH
      const webhookSecret = (globalThis as any).Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
      if (!webhookSecret) throw new Error("Server Configuration Error: Webhook secret missing.");
      
      const isValid = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
      if (!isValid) {
        console.error("Security Alert: Invalid Webhook Signature.");
        return new Response(JSON.stringify({ error: "Unauthorized Webhook Path." }), { status: 401, headers: corsHeaders });
      }

      const payload = JSON.parse(rawBody);
      const payment = payload.payload.payment.entity;
      orderId = payment.order_id;
      paymentId = payment.id;
      teamData = payment.notes?.teamData ? JSON.parse(payment.notes.teamData) : {
        teamname: payment.notes?.teamName,
        leademail: payment.notes?.leadEmail
      };
    } else {
      // CLIENT PATH (OR ADMIN OVERRIDE)
      const body = JSON.parse(rawBody);
      orderId = body.orderId;
      paymentId = body.paymentId;
      signature = body.signature;
      teamData = body.teamData;

      const rzpSecret = (globalThis as any).Deno.env.get("RAZORPAY_SECRET");
      
      // Verification logic:
      // 1. If user provided a signature, verify it against Razorpay Secret.
      // 2. If no signature, check if requester is an authorized Admin.
      if (orderId && signature && rzpSecret) {
        const isValid = await verifySignature(`${orderId}|${paymentId}`, signature, rzpSecret);
        if (!isValid) {
          console.error("Security Alert: Invalid Client Payment Signature.");
          return new Response(JSON.stringify({ error: "Invalid Payment Signature." }), { status: 400, headers: corsHeaders });
        }
      } else if (clientAuth && adminHash && clientAuth === adminHash) {
        // Authorized Admin Override - Allow processing without signature
        console.log("Admin Override: Processing payment record manually.");
      } else {
        console.warn("Security Alert: Blocked unauthorized verify-payment trigger (No signature or admin auth).");
        return new Response(JSON.stringify({ error: "Unauthorized Access Path." }), { status: 401, headers: corsHeaders });
      }
    }

    if (!paymentId) throw new Error("Missing Payment ID.");

    // Check for existing record to prevent duplicates
    const { data: existing } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('razorpaypaymentid', paymentId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: true, data: existing }), { headers: corsHeaders });
    }

    // Generate new unique TALOS ID
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const teamID = `TALOS-${array[0].toString(36).substring(0, 6).toUpperCase()}`;
    
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

    return new Response(JSON.stringify({ success: true, data }), { headers: corsHeaders });
  } catch (error) {
    console.error("Payment Verification Fatal Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Validation processing failed." }), { status: 500, headers: corsHeaders });
  }
})
