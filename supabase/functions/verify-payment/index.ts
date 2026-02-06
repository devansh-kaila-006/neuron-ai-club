
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

    const rzpWebhookSignature = req.headers.get('x-razorpay-signature');
    const clientAuth = req.headers.get('x-neural-auth');
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    
    const rawBody = await req.text();
    let orderId, paymentId, teamData, signature;

    if (rzpWebhookSignature) {
      // WEBHOOK PATH
      console.log("Processing Webhook Pulse...");
      const webhookSecret = (globalThis as any).Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
      if (!webhookSecret) {
        console.error("WEBHOOK ERROR: RAZORPAY_WEBHOOK_SECRET missing.");
        return new Response(JSON.stringify({ error: "Webhook secret missing." }), { status: 500, headers: corsHeaders });
      }
      
      const isValid = await verifySignature(rawBody, rzpWebhookSignature, webhookSecret);
      if (!isValid) {
        console.warn("Security Alert: Invalid Webhook Signature.");
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
      teamData = body.teamData || {};

      const rzpSecret = (globalThis as any).Deno.env.get("RAZORPAY_SECRET");
      
      if (orderId && signature && rzpSecret) {
        console.log("Verifying standard Razorpay signature...");
        const isValid = await verifySignature(`${orderId}|${paymentId}`, signature, rzpSecret);
        if (!isValid) {
          console.warn(`Security Alert: Invalid Client Signature for Order ${orderId}`);
          return new Response(JSON.stringify({ error: "Invalid Payment Signature." }), { status: 400, headers: corsHeaders });
        }
      } else if (clientAuth && adminHash && clientAuth === adminHash) {
        console.log("Neural Authorization: Identity confirmed. Processing deployment.");
      } else {
        const reason = !adminHash ? "ADMIN_HASH missing in cloud." : 
                       !clientAuth ? "x-neural-auth missing in request." : 
                       "Admin identity mismatch.";
        console.warn(`Security Alert: Blocked unauthorized trigger. Reason: ${reason}`);
        return new Response(JSON.stringify({ 
          error: "Unauthorized Access Path.", 
          details: reason,
          isConfigError: !adminHash 
        }), { status: 401, headers: corsHeaders });
      }
    }

    if (!paymentId) throw new Error("Critical: Missing Payment ID in sequence.");

    // Check for existing record
    const { data: existing } = await supabaseAdmin
      .from('teams')
      .select('*')
      .eq('razorpaypaymentid', paymentId)
      .maybeSingle();

    if (existing) {
      console.log(`Duplicate suppression: Payment ${paymentId} already anchored.`);
      return new Response(JSON.stringify({ success: true, data: existing }), { headers: corsHeaders });
    }

    // Generate TALOS ID
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const teamID = `TALOS-${array[0].toString(36).substring(0, 6).toUpperCase()}`;
    
    const fullTeam = {
      teamname: teamData.teamname || teamData.teamName || "Unnamed Squad",
      leademail: teamData.leademail || teamData.leadEmail || "unknown@neuro.hub",
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
      console.error("Database Upsert Failure:", error);
      throw error;
    }

    console.log(`Neural Success: Squad ${fullTeam.teamid} deployed.`);
    return new Response(JSON.stringify({ success: true, data }), { headers: corsHeaders });

  } catch (error) {
    console.error("Payment Verification Fatal Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Validation processing failed.", 
      details: error.message 
    }), { status: 500, headers: corsHeaders });
  }
})
