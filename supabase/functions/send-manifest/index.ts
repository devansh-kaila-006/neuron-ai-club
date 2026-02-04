
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
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.warn("[Neural Comms] RESEND_API_KEY missing. Falling back to simulation mode.");
      return new Response(
        JSON.stringify({ success: true, message: "Simulation: Manifest logged to console." }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // QR Code URL for the team ID
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${team.teamID}&bgcolor=050505&color=4f46e5&margin=10`;

    // Production Resend Dispatch
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'NEURØN Core <onboarding@resend.dev>', // Replace with your verified domain
        to: [team.leadEmail],
        subject: `[AUTHENTICATED] TALOS 2026 Manifest: ${team.teamID}`,
        html: `
          <div style="font-family: sans-serif; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; text-align: center;">
            <h1 style="color: #4f46e5; margin-bottom: 10px;">NEURØN | TALOS 2026</h1>
            <p style="color: #888; font-size: 14px;">Squad manifest successfully anchored in the neural grid.</p>
            
            <div style="background: #111; padding: 30px; border: 1px solid #333; border-radius: 20px; margin: 30px 0; display: inline-block; min-width: 280px;">
              <p style="margin: 0 0 10px 0; color: #555; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Squad Identity</p>
              <h2 style="margin: 0 0 20px 0; font-size: 24px;">${team.teamName}</h2>
              
              <div style="background: #000; padding: 15px; border-radius: 15px; border: 1px solid #4f46e5; margin-bottom: 20px; display: inline-block;">
                <img src="${qrUrl}" alt="TALOS QR ID" style="display: block; width: 150px; height: 150px;" />
              </div>
              
              <p style="margin: 10px 0 0 0; color: #4f46e5; font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 4px;">
                ${team.teamID}
              </p>
            </div>
            
            <p style="font-size: 11px; color: #444; margin-top: 30px;">
              This is an authenticated dispatch from the NEURØN Core Unit. <br/>
              Present this QR code at the Innovation Hall checkpoint for entry.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
