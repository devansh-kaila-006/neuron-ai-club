
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
    const { orderId, paymentId, signature, teamData } = await req.json()
    // Using process.env to access secrets as Deno.env is reporting missing property 'env'.
    const secret = process.env.RAZORPAY_SECRET

    if (!secret) throw new Error('RAZORPAY_SECRET not configured.')

    // HMAC Verification
    const body = orderId + "|" + paymentId
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (signature !== expectedSignature) {
      return new Response(JSON.stringify({ success: false, message: "Invalid Signature" }), { status: 400, headers: corsHeaders })
    }

    // Initialize Supabase Admin using process.env for environment variables.
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    const teamID = `TALOS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const fullTeam = {
      ...teamData,
      id: crypto.randomUUID(),
      teamID,
      paymentStatus: 'paid',
      checkedIn: false,
      registeredAt: Date.now(),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId
    }

    const { data, error } = await supabaseAdmin
      .from('teams')
      .insert(fullTeam)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
