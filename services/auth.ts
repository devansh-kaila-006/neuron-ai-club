
import { api } from './api.ts';
import { supabase } from '../lib/storage.ts';

export const authService = {
  /**
   * Neural Authentication Gateway
   * Proxies verification to Supabase Edge Functions.
   */
  async signIn(password: string) {
    return api.call(async () => {
      if (!supabase) throw new Error("Neural Grid Offline.");

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { password }
      });

      // Handle Edge Function infrastructure errors (4xx/5xx)
      if (error) {
        console.error("Supabase Invoke Error:", error);
        let errorMsg = "Authorization sequence rejected.";
        try {
          const context = await error.context?.json();
          errorMsg = context?.error || context?.details || error.message;
        } catch {
          errorMsg = error.message;
        }
        throw new Error(errorMsg);
      }

      // Handle application-level errors returned with 200 OK
      if (!data || data.success === false) {
        console.warn("Auth Rejection Payload:", data);
        const reason = data?.error || data?.details || "Neural link rejected: Verification failed.";
        throw new Error(reason);
      }
      
      const { token, user } = data;
      sessionStorage.setItem('neuron_session_token', token);
      
      return { success: true, user, token };
    });
  },

  getStoredHash() {
    return sessionStorage.getItem('neuron_session_token');
  },

  async getSession() {
    const token = this.getStoredHash();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      
      if (payload.exp < Date.now()) {
        this.signOut();
        return null;
      }
      return payload;
    } catch { return null; }
  },

  async signOut() {
    sessionStorage.removeItem('neuron_session_token');
  }
};
