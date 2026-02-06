
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
      if (!supabase) throw new Error("Neural Connection Lost.");

      const sessionHash = authService.getStoredHash();

      const { data, error } = await supabase.functions.invoke('send-manifest', {
        body: { team },
        headers: {
          'x-neural-auth': sessionHash || ''
        }
      });

      if (error) {
        throw new Error(`Dispatch Error: Service unavailable.`);
      }

      return data;
    });
  }
};
