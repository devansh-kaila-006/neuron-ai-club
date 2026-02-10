
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
    const { password } = await req.json();
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const tokenSecret = (globalThis as any).Deno.env.get("ADMIN_TOKEN_SECRET");

    if (!password || !adminHash || !tokenSecret) {
      return new Response(JSON.stringify({ error: "Security lockdown: System misconfigured." }), { status: 500, headers: corsHeaders });
    }

    const inputHash = await sha256(password);

    if (inputHash !== adminHash) {
      return new Response(JSON.stringify({ error: "Access Denied: Invalid signature sequence." }), { status: 401, headers: corsHeaders });
    }

    // Generate a simple secure token (In production, use a proper JWT library)
    const payload = {
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + (1000 * 60 * 60 * 12)
    };
    const payloadStr = btoa(JSON.stringify(payload));
    
    // Sign the payload
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
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})
