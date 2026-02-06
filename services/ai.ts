
import { supabase } from '../lib/storage.ts';
import { authService } from './auth.ts';

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

    // SECURITY: Get hash from active session (derived from password)
    const sessionHash = authService.getStoredHash();

    // Attempt to call the Edge Function
    const response = await supabase.functions.invoke('neural-chat', {
      body: { prompt, history },
      headers: {
        'x-neural-auth': sessionHash || ''
      }
    });

    if (response.error) {
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
