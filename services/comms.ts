
import { api } from './api.ts';
import { supabase } from '../lib/storage.ts';
import { Team } from '../lib/types.ts';
import { authService } from './auth.ts';

/**
 * Production Communication Service - Proxied
 */
export const commsService = {
  async sendManifestEmail(team: Team) {
    return api.call(async () => {
      console.log(`NEURØN Service: Initiating manifest dispatch for ${team.teamid}...`);
      
      if (!supabase) throw new Error("Neural Connection Lost.");

      const sessionHash = authService.getStoredHash();

      const { data, error } = await supabase.functions.invoke('send-manifest', {
        body: { team },
        headers: {
          'x-neural-auth': sessionHash || ''
        }
      });

      if (error) {
        console.error("Supabase Invoke Error (send-manifest):", error);
        throw new Error(`Dispatch Error: Service unavailable.`);
      }

      if (data && data.success === false) {
        throw new Error(data.error || "Neural dispatch rejected.");
      }

      return data;
    });
  }
};
