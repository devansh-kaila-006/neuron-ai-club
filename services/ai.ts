
import { supabase } from '../lib/storage.ts';

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
 * This ensures the API_KEY never leaves the server.
 */
export const getNeuralResponse = async (prompt: string, history: MessageHistory[] = []): Promise<NeuralResponse> => {
  try {
    if (!supabase) throw new Error("Neural Uplink: Supabase connection inactive.");

    const { data, error } = await supabase.functions.invoke('neural-chat', {
      body: { prompt, history }
    });

    if (error) throw error;
    return data as NeuralResponse;
  } catch (err) {
    console.error("Neural Error:", err);
    return { text: "Neural Link Error: The uplink is currently unstable." };
  }
};
