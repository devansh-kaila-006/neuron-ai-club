import { api } from './api.ts';
import CryptoJS from 'crypto-js';
import { getEnv } from '../lib/env.ts';

export const authService = {
  /**
   * Neural Authentication Gateway
   * Verifies the provided credentials against the hashed system key.
   */
  async signIn(password: string) {
    return api.call(async () => {
      // SECURITY: Compute the SHA-256 hash of the input
      const inputHash = CryptoJS.SHA256(password).toString();
      
      // Retrieve the master hash from environment
      const adminHash = getEnv('ADMIN_HASH');

      // Fail-safe check: If hash is not configured, deny all access for security
      if (!adminHash) {
        console.error("NEURØN Security Breach: VITE_ADMIN_HASH is not configured in the environment.");
        throw new Error("System lockdown: Admin gateway is not initialized.");
      }

      // Comparison check
      if (inputHash !== adminHash) {
        throw new Error("Invalid access key: Authorization sequence rejected.");
      }
      
      const payload = { 
        role: 'ADMIN', 
        hash: inputHash, // Secure session token anchor
        iat: Date.now(), 
        exp: Date.now() + (1000 * 60 * 60 * 24) // 24 hour session duration
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