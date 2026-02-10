
import { api } from './api.ts';
import { supabase } from '../lib/storage.ts';

export const authService = {
  /**
   * Neural Authentication Gateway
   * Proxies verification to Supabase Edge Functions to keep secrets off the client.
   */
  async signIn(password: string) {
    return api.call(async () => {
      if (!supabase) throw new Error("Neural Grid Offline.");

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { password }
      });

      if (error) {
        let errorMsg = "Authorization sequence rejected.";
        try {
          // Attempt to extract the specific error from the function response
          const context = await error.context?.json();
          errorMsg = context?.error || context?.details || error.message;
        } catch {
          errorMsg = error.message;
        }
        throw new Error(errorMsg);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Neural link rejected.");
      }
      
      const { token, user } = data;
      sessionStorage.setItem('neuron_session_token', token);
      
      return { user, token };
    });
  },

  /**
   * Extracts the identifying hash/token from storage.
   * This is sent as a header to authorize Edge Function actions.
   */
  getStoredHash() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token) return null;
    return token;
  },

  async getSession() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token) return null;
    try {
      // Tokens are opaque to the client, but contain a public payload for UI
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp < Date.now()) {
        sessionStorage.removeItem('neuron_session_token');
        return null;
      }
      return payload;
    } catch { return null; }
  },

  async signOut() {
    sessionStorage.removeItem('neuron_session_token');
  }
};
