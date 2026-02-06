
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

    // Attempt to call the Edge Function
    const response = await supabase.functions.invoke('neural-chat', {
      body: { prompt, history },
      headers: {
        'x-neural-auth': adminHash || ''
      }
    });

    // Supabase client handles non-2xx as 'error'
    if (response.error) {
      // Try to parse error body if it exists
      let errorData;
      try {
        errorData = await response.error.context?.json();
      } catch {
        errorData = { error: response.error.message };
      }
      throw new Error(errorData?.error || response.error.message || "Uplink Error");
    }

    if (response.data?.error) {
      throw new Error(response.data.error);
    }

    return response.data as NeuralResponse;
  } catch (err: any) {
    console.error("Neural Service Error:", err);
    return { 
      text: `Neural Link Failure: ${err.message || "The uplink is currently shielded or offline."}` 
    };
  }
};
