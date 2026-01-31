
import { api } from './api.ts';

/**
 * Universal environment variable retriever.
 * Checks all possible locations where Vercel, Vite, or the platform might inject variables.
 */
const getEnv = (key: string): string | undefined => {
  try {
    // 1. Check window.process.env (standard browser shim)
    if (typeof window !== 'undefined' && (window as any).process?.env?.[key]) {
      return (window as any).process.env[key];
    }

    // 2. Check import.meta.env (Vite standard)
    // We check both the raw key and the VITE_ prefixed version
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
      if (metaEnv[key]) return metaEnv[key];
    }

    // 3. Check global process (Node-like environments or specific shims)
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key];
    }

    // 4. Check globalThis
    if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.[key]) {
      return (globalThis as any).process.env[key];
    }

    return undefined;
  } catch (e) {
    return undefined;
  }
};

export const authService = {
  async signIn(password: string) {
    return api.call(async () => {
      // Priority 1: Check for VITE_ADMIN_ACCESS_KEY (Vite convention)
      // Priority 2: Check for ADMIN_ACCESS_KEY (Vercel standard)
      const secureKey = getEnv("ADMIN_ACCESS_KEY");
      
      if (!secureKey) {
        console.error("NEURØN Security: ADMIN_ACCESS_KEY is missing from the environment.");
        throw { 
          status: 500, 
          message: "SYSTEM ERROR: ADMIN_ACCESS_KEY is not configured. Please ensure it is set in the Vercel Dashboard (as either ADMIN_ACCESS_KEY or VITE_ADMIN_ACCESS_KEY) and that you have redeployed the application." 
        };
      }

      if (password === secureKey) {
        const payload = { 
          role: 'ADMIN', 
          iat: Date.now(), 
          exp: Date.now() + (1000 * 60 * 60 * 24) 
        };
        const token = `neuron_auth_v3_${btoa(JSON.stringify(payload))}`;
        sessionStorage.setItem('neuron_session_token', token);
        return { user: { name: 'Admin', role: 'ADMIN' }, token };
      }
      
      throw { status: 401, message: "Invalid access sequence. Authentication denied." };
    });
  },

  async getSession() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token || !token.startsWith('neuron_auth_v3_')) return null;
    try {
      const payload = JSON.parse(atob(token.replace('neuron_auth_v3_', '')));
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
