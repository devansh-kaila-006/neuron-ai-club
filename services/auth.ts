
import { api } from './api.ts';
import CryptoJS from 'crypto-js';

/**
 * Universal environment variable retriever.
 */
const getEnv = (key: string): string | undefined => {
  try {
    if (typeof window !== 'undefined' && (window as any).process?.env) {
      const val = (window as any).process.env[key] || (window as any).process.env[`VITE_${key}`];
      if (val) return val;
    }

    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[key]) return metaEnv[key];
      if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
    }

    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[key] || process.env[`VITE_${key}`];
      if (val) return val;
    }

    return undefined;
  } catch (e) {
    return undefined;
  }
};

export const authService = {
  /**
   * Secure Hashed SignIn
   * Compares the SHA-256 hash of the input password with the hash stored in VITE_ADMIN_HASH.
   * This ensures the plain-text password is never exposed in the source code.
   */
  async signIn(password: string) {
    return api.call(async () => {
      // Look for the HASH, not the plain text key
      const secureHash = getEnv("ADMIN_HASH");
      
      if (!secureHash) {
        console.error("NEURØN Security: VITE_ADMIN_HASH is missing from environment. Authentication disabled.");
        throw { 
          status: 500, 
          message: "CRITICAL: Security Grid Offline. ADMIN_HASH not detected in system environment." 
        };
      }

      // Compute hash of user input
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
      
      throw { status: 401, message: "Invalid access sequence. Authentication denied." };
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
