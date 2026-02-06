
import { api } from './api.ts';
import { supabase } from '../lib/storage.ts';
import { Team } from '../lib/types.ts';
import { getEnv } from '../lib/env.ts';

/**
 * Production Communication Service - Proxied
 */
export const commsService = {
  async sendManifestEmail(team: Team) {
    return api.call(async () => {
      if (!supabase) throw new Error("Neural Connection Lost.");

      const adminHash = getEnv("ADMIN_HASH");

      const { data, error } = await supabase.functions.invoke('send-manifest', {
        body: { team },
        headers: {
          'x-neural-auth': adminHash || ''
        }
      });

      if (error) {
        throw new Error(`Dispatch Error: Service unavailable.`);
      }

      return data;
    });
  }
};