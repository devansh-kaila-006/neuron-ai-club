
import { api } from './api.ts';

/**
 * Universal environment variable retriever.
 * Checks all possible locations where Vercel, Vite, or the platform might inject variables.
 */
const getEnv = (key: string): string | undefined => {
  try {
    // 1. Check window.process.env (standard browser shim)
    if (typeof window !== 'undefined' && (window as any).process?.env) {
      const val = (window as any).process.env[key] || (window as any).process.env[`VITE_${key}`];
      if (val) return val;
    }

    // 2. Check import.meta.env (Vite standard)
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[key]) return metaEnv[key];
      if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
    }

    // 3. Check global process
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
  async signIn(password: string) {
    return api.call(async () => {
      const secureKey = getEnv("ADMIN_ACCESS_KEY");
      
      if (!secureKey) {
        console.error("NEURØN Security: ADMIN_ACCESS_KEY is missing from all detected environment objects.");
        throw { 
          status: 500, 
          message: "SYSTEM ERROR: ADMIN_ACCESS_KEY not found. Ensure the variable is set in the Vercel Dashboard. If you just set it, you MUST redeploy the app for the change to take effect in the browser bundle." 
        };
      }

      if (password === secureKey) {
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
