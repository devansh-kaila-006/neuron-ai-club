
import { api } from './api.ts';
import CryptoJS from 'crypto-js';
import { getEnv } from '../lib/env.ts';

export const authService = {
  /**
   * Secure Hashed SignIn
   * Compares the SHA-256 hash of the input password with the hash stored in VITE_ADMIN_HASH.
   */
  async signIn(password: string) {
    return api.call(async () => {
      // Look for the HASH in environment (VITE_ADMIN_HASH or ADMIN_HASH)
      const secureHash = getEnv("ADMIN_HASH");
      
      if (!secureHash) {
        console.error("NEURØN Security: ADMIN_HASH is missing from environment.");
        throw { 
          status: 500, 
          message: "CRITICAL: Security Grid Offline. ADMIN_HASH not detected." 
        };
      }

      const inputHash = CryptoJS.SHA256(password).toString();

      if (inputHash === secureHash) {
        const payload = { 
          role: 'ADMIN', 
          iat: Date.now(), 
          exp: Date.now() + (1000 * 60 * 60 * 24) 
        };
        const token = `neuron_auth_v4_${btoa(JSON.stringify(payload))}`;
        sessionStorage.setItem('neuron_session_token', token);
        return { user: { name: 'Admin', role: 'ADMIN' }, token };
      }
      
      throw { status: 401, message: "Invalid access sequence. Denied." };
    });
  },

  async getSession() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token || !token.startsWith('neuron_auth_v4_')) return null;
    try {
      const payload = JSON.parse(atob(token.replace('neuron_auth_v4_', '')));
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
