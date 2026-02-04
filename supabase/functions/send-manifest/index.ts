
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
    const { team } = await req.json()
    
    // Support multiple keys comma-separated
    const keysString = process.env.RESEND_API_KEYS || process.env.RESEND_API_KEY || "";
    const apiKeys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (apiKeys.length === 0) {
      console.warn("[Neural Comms] No Resend API Keys found. Simulation mode.");
      return new Response(
        JSON.stringify({ success: true, message: "Simulation: Manifest logged." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${team.teamID}&bgcolor=050505&color=4f46e5&margin=10`;
    
    let lastError = null;
    let success = false;
    let responseData = null;

    // Try each API key until one succeeds (for rate limit handling)
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
            to: [team.leadEmail],
            subject: `[AUTHENTICATED] TALOS 2026 Manifest: ${team.teamID}`,
            html: `
              <div style="font-family: sans-serif; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; text-align: center;">
                <h1 style="color: #4f46e5; margin-bottom: 10px;">NEURØN | TALOS 2026</h1>
                <p style="color: #888; font-size: 14px;">Squad manifest anchored for Feb 20, 2026.</p>
                
                <div style="background: #111; padding: 30px; border: 1px solid #333; border-radius: 20px; margin: 30px 0; display: inline-block;">
                  <p style="color: #555; font-size: 10px; text-transform: uppercase;">Squad Identity</p>
                  <h2 style="font-size: 24px;">${team.teamName}</h2>
                  <img src="${qrUrl}" alt="QR" style="width: 150px; height: 150px; border: 1px solid #4f46e5; margin: 20px 0;" />
                  <p style="color: #4f46e5; font-family: monospace; font-size: 20px; letter-spacing: 4px;">${team.teamID}</p>
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
          console.warn(`[Neural Comms] Key rotation: ${lastError}`);
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!success) {
      throw new Error(`All dispatch channels exhausted: ${lastError}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
