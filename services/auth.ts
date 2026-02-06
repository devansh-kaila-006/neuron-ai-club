
import { api } from './api.ts';
import CryptoJS from 'crypto-js';

export const authService = {
  /**
   * Neural Authentication Gateway
   * Moves verification logic to the server. The client no longer stores the 'Truth' (hash).
   * Verification happens implicitly when calling Edge Functions.
   */
  async signIn(password: string) {
    return api.call(async () => {
      // SECURITY: We generate the hash and store it as the session token.
      const inputHash = CryptoJS.SHA256(password).toString();
      
      const payload = { 
        role: 'ADMIN', 
        hash: inputHash, // This will be used in the x-neural-auth header
        iat: Date.now(), 
        exp: Date.now() + (1000 * 60 * 60 * 24) 
      };

      const token = `neuron_auth_v5_${btoa(JSON.stringify(payload))}`;
      sessionStorage.setItem('neuron_session_token', token);
      
      return { user: { name: 'Admin', role: 'ADMIN' }, token };
    });
  },

  getStoredHash() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token || !token.startsWith('neuron_auth_v5_')) return null;
    try {
      const payload = JSON.parse(atob(token.replace('neuron_auth_v5_', '')));
      if (payload.exp < Date.now()) return null;
      return payload.hash;
    } catch { return null; }
  },

  async getSession() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token || !token.startsWith('neuron_auth_v5_')) return null;
    try {
      const payload = JSON.parse(atob(token.replace('neuron_auth_v5_', '')));
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
