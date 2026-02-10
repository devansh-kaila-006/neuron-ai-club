
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
    // IMPORTANT: These must be in "Edge Function Environment Variables", NOT just the Vault.
    const adminHashRaw = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const tokenSecretRaw = (globalThis as any).Deno.env.get("ADMIN_TOKEN_SECRET");

    const adminHash = adminHashRaw?.trim();
    const tokenSecret = tokenSecretRaw?.trim();

    // 1. Check for missing configuration
    if (!adminHash || !tokenSecret) {
      const missing = [];
      if (!adminHash) missing.push("ADMIN_HASH");
      if (!tokenSecret) missing.push("ADMIN_TOKEN_SECRET");
      
      console.error(`NEURØN Security Error: Missing variables: ${missing.join(", ")}`);
      return new Response(JSON.stringify({ 
        success: false,
        error: "System Configuration Failure", 
        details: `Missing environment variables in Supabase: ${missing.join(", ")}. Ensure they are added in Project Settings -> Edge Functions.`
      }), { status: 200, headers: corsHeaders });
    }

    // 2. Validate password presence
    if (!password) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "Access Denied: Signature required." 
      }), { status: 200, headers: corsHeaders });
    }

    const inputHash = await sha256(password);

    // 3. Perform comparison
    if (inputHash.toLowerCase() !== adminHash.toLowerCase()) {
      console.warn("NEURØN Security: Unauthorized access attempt detected.");
      return new Response(JSON.stringify({ 
        success: false,
        error: "Access Denied: Invalid signature sequence." 
      }), { status: 200, headers: corsHeaders });
    }

    // 4. Generate Session
    const payload = {
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + (1000 * 60 * 60 * 12)
    };
    const payloadStr = btoa(JSON.stringify(payload));
    
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
    }), { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error("NEURØN Critical Error:", error.message);
    return new Response(JSON.stringify({ 
      success: false,
      error: "Internal Neural Link Error", 
      details: error.message 
    }), { status: 200, headers: corsHeaders });
  }
})
