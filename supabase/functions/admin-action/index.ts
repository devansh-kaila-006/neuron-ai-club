
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-neural-auth, x-neuron-client',
}

async function verifyToken(token: string, secret: string) {
  try {
    const [signature, payloadStr] = token.split('.');
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    // Convert signature back to bytes
    const sigArray = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const isValid = await crypto.subtle.verify("HMAC", key, sigArray, encoder.encode(payloadStr));
    if (!isValid) return null;

    const payload = JSON.parse(atob(payloadStr));
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const tokenSecretRaw = (globalThis as any).Deno.env.get("ADMIN_TOKEN_SECRET");
    const tokenSecret = tokenSecretRaw?.trim();
    
    const clientToken = req.headers.get('x-neural-auth');
    
    if (!clientToken || !tokenSecret) {
      return new Response(JSON.stringify({ error: "Access Denied: Neural link missing." }), { status: 401, headers: corsHeaders });
    }

    const payload = await verifyToken(clientToken, tokenSecret);
    if (!payload) {
      return new Response(JSON.stringify({ error: "Access Denied: Token forged or expired." }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = (globalThis as any).Deno.env.get("SUPABASE_URL");
    const supabaseKey = (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { action, payload: data } = await req.json();

    if (action === 'UPDATE_CHECKIN') {
      const { id, status } = data;
      const { data: result, error } = await supabaseAdmin
        .from('teams')
        .update({ checkedin: status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: result }), { headers: corsHeaders });
    }

    if (action === 'SAVE_TEAM') {
      const { error } = await supabaseAdmin
        .from('teams')
        .upsert(data, { onConflict: 'id' });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === 'DELETE_TEAM') {
      const { error } = await supabaseAdmin
        .from('teams')
        .delete()
        .eq('id', data.id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Unknown Action Sequence." }), { status: 400, headers: corsHeaders });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})
