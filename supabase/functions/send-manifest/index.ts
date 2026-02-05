import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const team = body.team;

    // VALIDATION: Prevent Resend from failing due to missing recipient email
    if (!team || !team.leademail) {
      console.error("[Neural Comms] Invalid manifest data received:", team);
      throw new Error("Manifest Data Corruption: Missing recipient identity.");
    }
    
    // Support rotated keys for high-availability
    const keysString = (globalThis as any).Deno.env.get("RESEND_API_KEYS") || (globalThis as any).Deno.env.get("RESEND_API_KEY") || "";
    const apiKeys = keysString.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      console.warn("[Neural Comms] No Resend keys detected. System in simulation mode.");
      return new Response(
        JSON.stringify({ success: true, message: "Simulation Mode: No dispatch sent." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${team.teamid}&bgcolor=050505&color=4f46e5&margin=10`;
    
    let lastError = null;
    let success = false;
    let responseData = null;

    // High-availability rotation: Try each key until one succeeds
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
                <p style="color: #888; font-size: 14px;">Squad manifest anchored for Feb 20, 2026.</p>
                <div style="background: #111; padding: 30px; border: 1px solid #333; border-radius: 20px; margin: 30px 0; display: inline-block;">
                  <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Squad Identity</p>
                  <h2 style="font-size: 24px; margin: 10px 0;">${team.teamname}</h2>
                  <img src="${qrUrl}" alt="QR" style="width: 150px; height: 150px; border: 1px solid #4f46e5; margin: 20px 0; background: #000;" />
                  <p style="color: #4f46e5; font-family: monospace; font-size: 20px; letter-spacing: 4px; margin: 0;">${team.teamid}</p>
                </div>
                <p style="color: #444; font-size: 11px; margin-top: 20px;">Present this digital manifest at the Innovation Hall check-in node.</p>
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

    if (!success) {
      throw new Error(`Neural Comms Failure: All SMTP nodes failed. Last Error: ${lastError}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("[Neural Comms Error]:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})