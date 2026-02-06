import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-neural-auth',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SECURITY FIX: Verify shared secret
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const clientAuth = req.headers.get('x-neural-auth');
    
    if (adminHash && clientAuth !== adminHash) {
      return new Response(JSON.stringify({ error: "Access Denied." }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const team = body.team;

    if (!team || !team.leademail) {
      throw new Error("Missing recipient identity.");
    }
    
    const keysString = (globalThis as any).Deno.env.get("RESEND_API_KEYS") || (globalThis as any).Deno.env.get("RESEND_API_KEY") || "";
    const apiKeys = keysString.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Simulation Mode." }), { headers: corsHeaders });
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
                <p style="color: #888; font-size: 14px;">Squad manifest anchored.</p>
                <div style="background: #111; padding: 30px; border: 1px solid #333; border-radius: 20px; margin: 30px 0; display: inline-block;">
                  <h2 style="font-size: 24px; margin: 10px 0;">${team.teamname}</h2>
                  <img src="${qrUrl}" alt="QR" style="width: 150px; height: 150px; border: 1px solid #4f46e5; margin: 20px 0; background: #000;" />
                  <p style="color: #4f46e5; font-family: monospace; font-size: 20px; letter-spacing: 4px;">${team.teamid}</p>
                </div>
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
          continue;
        }
      } catch (err) {
        lastError = err.message;
        continue;
      }
    }

    if (!success) throw new Error("SMTP node failure.");

    return new Response(JSON.stringify({ success: true, data: responseData }), { headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ success: false }), { status: 500, headers: corsHeaders });
  }
})