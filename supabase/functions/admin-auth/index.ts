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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password } = await req.json();
    
    // Retrieve variables from the Edge Function Environment
    // These must be set in the Supabase Dashboard -> Functions -> Settings
    // Fix: Use (globalThis as any).Deno to resolve "Cannot find name 'Deno'" in strict environments
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH")?.trim();
    // Fix: Use (globalThis as any).Deno to resolve "Cannot find name 'Deno'" in strict environments
    const tokenSecret = (globalThis as any).Deno.env.get("ADMIN_TOKEN_SECRET")?.trim();

    // Diagnostic: Check if environment is configured
    if (!adminHash || !tokenSecret) {
      console.error("NEURØN CONFIG ERROR: Missing ADMIN_HASH or ADMIN_TOKEN_SECRET");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "System Configuration Failure", 
        details: "Required environment variables (ADMIN_HASH/ADMIN_TOKEN_SECRET) are missing from the Supabase Edge Function context." 
      }), { 
        status: 200, // Keep 200 so the frontend can read the JSON error body
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Access Denied: Protocol requires a signature sequence." 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const inputHash = await sha256(password);

    // Case-insensitive hash comparison
    if (inputHash.toLowerCase() !== adminHash.toLowerCase()) {
      console.warn("NEURØN AUTH: Signature mismatch.");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Access Denied: Invalid signature sequence." 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Success Sequence: Generate JWT-like token
    const payload = {
      role: 'ADMIN',
      iat: Date.now(),
      exp: Date.now() + (1000 * 60 * 60 * 12) // 12-hour session
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
      .map(b => b.toString(16).padStart(2, '0')).join('');

    const token = `${signature}.${payloadStr}`;

    console.log("NEURØN AUTH: Terminal Authorized.");
    return new Response(JSON.stringify({ 
      success: true, 
      token, 
      user: { name: 'Core Admin', role: 'ADMIN' } 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (err) {
    console.error("NEURØN SYSTEM ERROR:", err.message);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Internal Neural Link Error", 
      details: err.message 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})