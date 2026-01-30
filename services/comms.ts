import { api } from './api.ts';
import { Team } from '../lib/types.ts';

const getEnv = (key: string): string | undefined => {
  try {
    return (window as any).process?.env?.[key] || (globalThis as any).process?.env?.[key];
  } catch { return undefined; }
};

/**
 * Production Communication Service
 * Bridged to EmailJS for automated participant manifest delivery.
 */
export const commsService = {
  async sendManifestEmail(team: Team) {
    return api.call(async () => {
      const publicKey = getEnv("EMAILJS_PUBLIC_KEY");
      const serviceId = getEnv("EMAILJS_SERVICE_ID");
      const templateId = getEnv("EMAILJS_TEMPLATE_ID");

      console.log(`[Neural Dispatch] Initializing for lead: ${team.leadEmail}`);

      // Failover to Simulation if keys are missing
      if (!publicKey || !serviceId || !templateId) {
        console.warn("[Neural Dispatch] EMAILJS configuration missing. Operating in simulation mode.");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { 
          status: "SIMULATED_SUCCESS",
          id: team.teamID,
          recipient: team.leadEmail 
        };
      }

      // Initialize EmailJS
      const emailjs = (window as any).emailjs;
      if (!emailjs) throw new Error("EmailJS SDK not loaded in host environment.");
      
      emailjs.init(publicKey);

      try {
        const response = await emailjs.send(serviceId, templateId, {
          team_name: team.teamName,
          team_id: team.teamID,
          lead_name: team.members[0].name,
          to_email: team.leadEmail,
          member_count: team.members.length,
          registration_date: new Date(team.registeredAt).toLocaleDateString(),
          manifest_link: `${window.location.origin}/#/register?lookup=${team.teamID}`
        });

        console.log("[Neural Dispatch] Email successfully routed through SMTP grid.", response);
        return response;
      } catch (err: any) {
        console.error("[Neural Dispatch] SMTP Routing Failure:", err);
        throw new Error(`Dispatch Error: ${err.text || "SMTP Link Unstable"}`);
      }
    });
  }
};