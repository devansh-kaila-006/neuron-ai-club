
import { supabase } from '../lib/storage.ts';
import { getEnv } from '../lib/env.ts';

export interface NeuralResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

export interface MessageHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * Neural AI Service - Proxied via Supabase Edge Functions
 */
export const getNeuralResponse = async (prompt: string, history: MessageHistory[] = []): Promise<NeuralResponse> => {
  try {
    if (!supabase) throw new Error("Neural Uplink inactive.");

    const adminHash = getEnv("ADMIN_HASH");

    const { data, error } = await supabase.functions.invoke('neural-chat', {
      body: { prompt, history },
      headers: {
        'x-neural-auth': adminHash || ''
      }
    });

    if (error) throw error;
    return data as NeuralResponse;
  } catch (err) {
    console.error("Neural Error: Uplink unstable.");
    return { text: "Neural Link Error: The uplink is currently unstable." };
  }
};