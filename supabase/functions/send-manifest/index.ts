
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
    const supabaseUrl = (globalThis as any).Deno.env.get("SUPABASE_URL");
    const supabaseKey = (globalThis as any).Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const clientAuth = req.headers.get('x-neural-auth');
    
    const body = await req.json();
    const team = body.team;

    if (!team || !team.id) {
      return new Response(JSON.stringify({ error: "Neural Identity missing." }), { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    let isAuthorized = false;

    // 1. Check for Admin Authorization
    if (adminHash && clientAuth === adminHash) {
      console.log("Admin Bypass: Manifest dispatch authorized via neural key.");
      isAuthorized = true;
    } 
    // 2. Check for Public Database-Verified Payment
    else {
      console.log(`Verifying payment status for team ${team.id} in grid...`);
      const { data: dbTeam, error: dbError } = await supabaseAdmin
        .from('teams')
        .select('paymentstatus, teamname, leademail, teamid')
        .eq('id', team.id)
        .single();

      if (dbError || !dbTeam) {
        console.warn("Security Alert: Attempted manifest dispatch for non-existent record.");
        return new Response(JSON.stringify({ error: "Access Denied: Neural record not found." }), { status: 401, headers: corsHeaders });
      }

      if (dbTeam.paymentstatus === 'paid') {
        isAuthorized = true;
        // Update local team object with DB values to ensure integrity
        team.teamname = dbTeam.teamname;
        team.leademail = dbTeam.leademail;
        team.teamid = dbTeam.teamid;
      } else {
        console.warn(`Security Alert: Blocked email attempt for unpaid squad: ${team.teamname}`);
        return new Response(JSON.stringify({ error: "Escrow required before manifest dispatch." }), { status: 401, headers: corsHeaders });
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Access Denied: Authentication sequence failed." }), { status: 401, headers: corsHeaders });
    }

    const keysString = (globalThis as any).Deno.env.get("RESEND_API_KEYS") || (globalThis as any).Deno.env.get("RESEND_API_KEY") || "";
    const apiKeys = keysString.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      console.log("No SMTP nodes configured. Manifesting in Simulation Mode.");
      return new Response(JSON.stringify({ success: true, message: "Simulation Mode: No API Key." }), { headers: corsHeaders });
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${team.teamid}&bgcolor=050505&color=4f46e5&margin=10`;
    
    let lastError = null;
    let success = false;
    let responseData = null;

    for (const apiKey of apiKeys) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from: 'NEURØN Core <onboarding@resend.dev>',
            to: [team.leademail],
            subject: `[AUTHENTICATED] TALOS 2026 Manifest: ${team.teamid}`,
            html: `
              <div style="font-family: sans-serif; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid #111;">
                <h1 style="color: #4f46e5; margin-bottom: 10px;">NEURØN | TALOS 2026</h1>
                <p style="color: #888; font-size: 14px;">Squad manifest anchored for <b>${team.teamname}</b>.</p>
                <div style="background: #111; padding: 30px; border: 1px solid #333; border-radius: 20px; margin: 30px 0; display: inline-block;">
                  <h2 style="font-size: 24px; margin: 10px 0;">SQUAD: ${team.teamname}</h2>
                  <img src="${qrUrl}" alt="QR" style="width: 150px; height: 150px; border: 1px solid #4f46e5; margin: 20px 0; background: #000;" />
                  <p style="color: #4f46e5; font-family: monospace; font-size: 20px; letter-spacing: 4px;">${team.teamid}</p>
                </div>
                <p style="font-size: 12px; color: #555; margin-top: 20px;">Present this sequence at the physical check-in point.</p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          responseData = await res.json();
          success = true;
          break;
        } else {
          lastError = await res.text();
          console.warn(`SMTP Node Failure: ${lastError}`);
          continue;
        }
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    if (!success) {
      console.error("Critical Grid Error: All SMTP nodes failed.");
      throw new Error(`SMTP node failure: ${lastError}`);
    }

    return new Response(JSON.stringify({ success: true, data: responseData }), { headers: corsHeaders });
  } catch (error) {
    console.error("Internal Neural Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
})
