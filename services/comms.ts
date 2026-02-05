
import { api } from './api.ts';
import { supabase } from '../lib/storage.ts';
import { Team } from '../lib/types.ts';

/**
 * Production Communication Service - Proxied
 * Sends manifests via Supabase Edge Function to prevent EmailJS key exposure.
 */
export const commsService = {
  async sendManifestEmail(team: Team) {
    return api.call(async () => {
      if (!supabase) throw new Error("Neural Connection Lost.");

      // Fix: Property name is lowercase 'leademail' in the Team type definition
      console.log(`[Neural Dispatch] Routing manifest for: ${team.leademail}`);

      const { data, error } = await supabase.functions.invoke('send-manifest', {
        body: { team }
      });

      if (error) {
        console.warn("[Neural Dispatch] SMTP Routing Failure. Manifest not delivered.");
        throw new Error(`Dispatch Error: ${error.message}`);
      }

      return data;
    });
  }
};
