
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
    
    // Support multiple keys comma-separated for surge protection
    const keysString = process.env.RESEND_API_KEYS || process.env.RESEND_API_KEY || "";
    const apiKeys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (apiKeys.length === 0) {
      console.warn("[Neural Comms] No Resend API Keys found. Simulation mode.");
      return new Response(
        JSON.stringify({ success: true, message: "Simulation: Manifest logged locally." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${team.teamID}&bgcolor=050505&color=4f46e5&margin=10`;
    
    let lastError = null;
    let success = false;
    let responseData = null;

    // Sequential key rotation for SMTP surge handling
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
              <div style="font-family: sans-serif; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; text-align: center; border: 1px solid #111;">
                <h1 style="color: #4f46e5; margin-bottom: 10px;">NEURØN | TALOS 2026</h1>
                <p style="color: #888; font-size: 14px;">Squad manifest anchored for Feb 20, 2026.</p>
                
                <div style="background: #111; padding: 30px; border: 1px solid #333; border-radius: 20px; margin: 30px 0; display: inline-block;">
                  <p style="color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Squad Identity</p>
                  <h2 style="font-size: 24px; margin: 10px 0;">${team.teamName}</h2>
                  <img src="${qrUrl}" alt="QR" style="width: 150px; height: 150px; border: 1px solid #4f46e5; margin: 20px 0; background: #000;" />
                  <p style="color: #4f46e5; font-family: monospace; font-size: 20px; letter-spacing: 4px; margin: 0;">${team.teamID}</p>
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
          const errorText = await res.text();
          lastError = errorText;
          console.warn(`[Neural Comms] SMTP Key rotation triggered. Key rejected: ${errorText}`);
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!success) {
      throw new Error(`All 4 dispatch channels exhausted. Last SMTP error: ${lastError}`);
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
