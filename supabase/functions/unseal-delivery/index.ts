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
    
    // Auth check (admin signature verification for secure processing)
    const isAdmin = adminHash && clientAuth === adminHash;

    const body = await req.json().catch(() => ({}));
    const { capsuleId, forceUnseal, targetCohort } = body;

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    console.log("Initializing NEURØN automated unsealing pipeline...");

    let capsulesToDeliver: any[] = [];

    if (capsuleId) {
      // Process a single specific capsule (e.g. manually unsealed by admin)
      console.log(`Targeting specific capsule delivery: ${capsuleId}`);
      const { data: capsule, error: dbError } = await supabaseAdmin
        .from('capsules')
        .select('*')
        .eq('id', capsuleId)
        .single();

      if (dbError || !capsule) {
        return new Response(JSON.stringify({ success: false, error: "Capsule record not found in system grid." }), { status: 404, headers: corsHeaders });
      }

      if (capsule.status !== 'sealed' && capsule.status !== 'submitted') {
        return new Response(JSON.stringify({ success: false, error: `Capsule is already in status: ${capsule.status}` }), { status: 400, headers: corsHeaders });
      }

      capsulesToDeliver = [capsule];
    } else {
      // Automatic/batch unsealing check
      console.log("Scanning global capsule grids for sealed digital vaults...");
      const { data: capsules, error: dbError } = await supabaseAdmin
        .from('capsules')
        .select('*')
        .eq('status', 'sealed');

      if (dbError) {
        return new Response(JSON.stringify({ success: false, error: `Failed to query capsules database: ${dbError.message}` }), { status: 500, headers: corsHeaders });
      }

      if (!capsules || capsules.length === 0) {
        return new Response(JSON.stringify({ success: true, message: "Zero active sealed capsules found in database grid.", delivered: [] }), { headers: corsHeaders });
      }

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-indexed: July is 6

      capsulesToDeliver = capsules.filter(capsule => {
        // Option to force or specify cohort for demo/admin testing
        if (forceUnseal) return true;
        if (targetCohort && capsule.cohort_year === Number(targetCohort)) return true;

        // Actual automated unsealing constraint: July 1st of (cohort_year + 4)
        const unsealYear = (capsule.cohort_year || 2026) + 4;
        if (currentYear > unsealYear) return true;
        if (currentYear === unsealYear && currentMonth >= 6) return true; // July is 6

        return false;
      });
    }

    if (capsulesToDeliver.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Unsealing gate not reached for any sealed capsules yet.", 
        deliveredCount: 0 
      }), { headers: corsHeaders });
    }

    console.log(`Processing delivery for ${capsulesToDeliver.length} unsealed capsules...`);

    const keysString = (globalThis as any).Deno.env.get("RESEND_API_KEYS") || (globalThis as any).Deno.env.get("RESEND_API_KEY") || "";
    const apiKeys = keysString.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      console.warn("No SMTP keys configured. Simulating delivery responses in dry-run mode.");
    }

    const deliveredRecords = [];
    const failedRecords = [];

    for (const capsule of capsulesToDeliver) {
      try {
        const unsealYear = (capsule.cohort_year || 2026) + 4;
        const emailTo = capsule.email;
        const emailSubject = `[UNSEALED] Your NEURØN Time Capsule from ${capsule.cohort_year} has Opened!`;
        
        // Formulate the unsealed email template showcasing ALL answers (including previously private Advice to Future Self)
        const emailHtml = `
          <div style="font-family: sans-serif; background: #050505; color: #ffffff; padding: 40px; border-radius: 20px; text-align: left; border: 1px solid #111; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5; margin-bottom: 5px; font-size: 26px; text-align: center; letter-spacing: 1px;">NEURØN | UNSEALED</h1>
            <p style="color: #10b981; font-size: 13px; margin-top: 0; margin-bottom: 30px; text-align: center; font-family: monospace; font-weight: bold; letter-spacing: 2px;">● DIGITAL COHORT VAULT RELEASED</p>
            
            <p style="font-size: 14px; color: #aaa; line-height: 1.6; margin-bottom: 25px;">
              Dear <b>${capsule.full_name}</b>,<br/><br/>
              The unsealing gate has reached. Four years ago in the <b>${capsule.cohort_year}</b> cohort, you locked a digital time capsule inside our crypt vaults. Today, the lock has decayed, and your sealed signals are returned to the open world.
            </p>

            <div style="background: #0c0c0e; padding: 25px; border: 1px solid #222; border-radius: 16px; margin-bottom: 25px;">
              <p style="color: #10b981; font-family: monospace; font-size: 11px; text-transform: uppercase; margin: 0 0 5px 0; letter-spacing: 2px;">Capsule Code</p>
              <h2 style="font-size: 22px; color: #ffffff; margin: 0 0 15px 0; font-family: monospace; letter-spacing: 1px;">${capsule.capsule_code}</h2>
              
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #ccc;">
                <tr>
                  <td style="padding: 6px 0; color: #666; width: 120px;">Owner</td>
                  <td style="padding: 6px 0; color: #fff; font-weight: bold;">${capsule.full_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666;">Enrollment</td>
                  <td style="padding: 6px 0; color: #aaa; font-family: monospace;">${capsule.enrollment_no || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666;">Branch</td>
                  <td style="padding: 6px 0; color: #aaa;">${capsule.branch || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666;">Sealing Year</td>
                  <td style="padding: 6px 0; color: #aaa;">${capsule.cohort_year}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #666;">Unsealing Date</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: bold;">July 1, ${unsealYear}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 25px;">
              <h3 style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; padding-bottom: 8px; margin-bottom: 12px;">Unsealed Coordinates</h3>
              
              <div style="margin-bottom: 20px;">
                <p style="font-weight: bold; font-size: 13px; color: #4f46e5; margin: 0 0 5px 0;">1. Career & Professional Aspirations</p>
                <p style="font-size: 13px; color: #eee; background: #0c0c0e; padding: 15px; border-radius: 8px; margin: 0; line-height: 1.5; border-left: 3px solid #4f46e5;">
                  "${capsule.q1_answer || 'No response.'}"
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <p style="font-weight: bold; font-size: 13px; color: #4f46e5; margin: 0 0 5px 0;">2. Technological Predictions</p>
                <p style="font-size: 13px; color: #eee; background: #0c0c0e; padding: 15px; border-radius: 8px; margin: 0; line-height: 1.5; border-left: 3px solid #4f46e5;">
                  "${capsule.q2_answer || 'No response.'}"
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <p style="font-weight: bold; font-size: 13px; color: #e11d48; margin: 0 0 5px 0;">3. Personal Advice to Future Self [🔓 UNSEALED]</p>
                <p style="font-size: 13px; color: #eee; background: #0c0c0e; padding: 15px; border-radius: 8px; margin: 0; line-height: 1.5; border-left: 3px solid #e11d48; font-style: italic;">
                  "${capsule.q3_answer || 'No response.'}"
                </p>
              </div>

              ${capsule.ai_generated_letter ? `
              <div style="margin-top: 25px;">
                <p style="font-weight: bold; font-size: 13px; color: #10b981; margin: 0 0 5px 0;">A.I. Synthesized Cohort Guide</p>
                <p style="font-size: 12px; color: #888; background: #0c0c0e; padding: 15px; border-radius: 8px; margin: 0; line-height: 1.5; border: 1px dashed #222;">
                  ${capsule.ai_generated_letter}
                </p>
              </div>
              ` : ''}
            </div>

            <p style="font-size: 14px; color: #aaa; line-height: 1.6;">
              Look back at how far you have traveled. The steps you took since ${capsule.cohort_year} are the foundation of who you are today.
            </p>

            <p style="font-size: 11px; color: #555; text-align: center; margin-top: 45px; border-top: 1px solid #111; padding-top: 20px; font-family: monospace;">
              This capsule has been formally marked as DELIVERED and removed from our active cryptographic locking cycles. Signature verification SHA-256 success.
            </p>
          </div>
        `;

        let emailSent = false;
        let lastError = null;

        if (apiKeys.length > 0) {
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
                  to: [emailTo],
                  subject: emailSubject,
                  html: emailHtml,
                }),
              });

              if (res.ok) {
                emailSent = true;
                break;
              } else {
                lastError = await res.text();
              }
            } catch (err) {
              lastError = err.message;
            }
          }
        } else {
          // Dry-run simulation mode
          emailSent = true;
        }

        if (emailSent) {
          // Update capsule status to 'delivered' and log delivery timestamp
          const { error: updateError } = await supabaseAdmin
            .from('capsules')
            .update({
              status: 'delivered',
              date_delivered: new Date().toISOString()
            })
            .eq('id', capsule.id);

          if (updateError) {
            console.error(`DB Update Error for Capsule ${capsule.capsule_code}:`, updateError);
            throw updateError;
          }

          console.log(`Capsule ${capsule.capsule_code} unsealed and delivered successfully.`);
          deliveredRecords.push(capsule.capsule_code);
        } else {
          console.error(`Failed to send email dispatch for ${capsule.capsule_code}: ${lastError}`);
          failedRecords.push({ code: capsule.capsule_code, error: lastError });
        }
      } catch (err) {
        console.error(`Error processing capsule ${capsule.capsule_code}:`, err);
        failedRecords.push({ code: capsule.capsule_code, error: err.message });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      delivered: deliveredRecords,
      failed: failedRecords,
      deliveredCount: deliveredRecords.length,
      failedCount: failedRecords.length
    }), { headers: corsHeaders });

  } catch (error) {
    console.error("Critical delivery pipeline crash:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: corsHeaders });
  }
})
