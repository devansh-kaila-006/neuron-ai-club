
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const clientAuth = req.headers.get('x-neural-auth');
    
    // SECURITY GATE: Only allow requests with valid admin credentials
    if (!adminHash || clientAuth !== adminHash) {
      return new Response(JSON.stringify({ error: "Access Denied: Invalid Security Sequence." }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = (globalThis as any).Deno.env.get("SUPABASE_URL");
    const supabaseKey = (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { action, payload } = await req.json();

    if (action === 'UPDATE_CHECKIN') {
      const { id, status } = payload;
      const { data, error } = await supabaseAdmin
        .from('teams')
        .update({ checkedin: status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers: corsHeaders });
    }

    if (action === 'SAVE_TEAM') {
      const { error } = await supabaseAdmin
        .from('teams')
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === 'DELETE_TEAM') {
      const { error } = await supabaseAdmin
        .from('teams')
        .delete()
        .eq('id', payload.id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Unknown Action Sequence." }), { status: 400, headers: corsHeaders });

  } catch (error) {
    console.error("Admin Action Failure:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})
