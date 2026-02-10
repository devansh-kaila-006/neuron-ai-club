
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-neural-auth, x-neuron-client',
}

async function sha256(message: string) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const { password } = body;
    
    // Retrieve and sanitize environment variables
    const adminHashRaw = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const tokenSecretRaw = (globalThis as any).Deno.env.get("ADMIN_TOKEN_SECRET");

    const adminHash = adminHashRaw?.trim();
    const tokenSecret = tokenSecretRaw?.trim();

    if (!password) {
      return new Response(JSON.stringify({ error: "Access Denied: Protocol requires a signature." }), { status: 400, headers: corsHeaders });
    }

    if (!adminHash || !tokenSecret) {
      console.error("NEURØN Security Error: ADMIN_HASH or ADMIN_TOKEN_SECRET not found in environment.");
      return new Response(JSON.stringify({ error: "Security lockdown: System misconfigured. Contact Core Unit." }), { status: 500, headers: corsHeaders });
    }

    const inputHash = await sha256(password);

    // Perform case-insensitive comparison to handle hex variations
    if (inputHash.toLowerCase() !== adminHash.toLowerCase()) {
      console.warn("NEURØN Security: Unauthorized access attempt detected.");
      return new Response(JSON.stringify({ error: "Access Denied: Invalid signature sequence." }), { status: 401, headers: corsHeaders });
    }

    // Generate a secure session payload
    const payload = {
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + (1000 * 60 * 60 * 12) // 12-hour terminal session
    };
    const payloadStr = btoa(JSON.stringify(payload));
    
    // Sign the payload using the token secret
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(tokenSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadStr));
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const token = `${signature}.${payloadStr}`;

    return new Response(JSON.stringify({ 
      success: true, 
      token, 
      user: { name: 'Core Admin', role: 'ADMIN' } 
    }), { headers: corsHeaders });

  } catch (error) {
    console.error("NEURØN Critical Error:", error.message);
    return new Response(JSON.stringify({ error: "Internal Neural Link Error", details: error.message }), { status: 500, headers: corsHeaders });
  }
})
