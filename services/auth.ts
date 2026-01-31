
import { api } from './api.ts';

const getEnv = (key: string): string | undefined => {
  try {
    // 1. Check window.process.env (standard shim)
    const winEnv = (window as any).process?.env?.[key];
    if (winEnv) return winEnv;

    // 2. Check import.meta.env (Vite native)
    const viteEnv = (import.meta as any).env?.[`VITE_${key}`] || (import.meta as any).env?.[key];
    if (viteEnv) return viteEnv;

    // 3. Check globalThis
    const globalEnv = (globalThis as any).process?.env?.[key];
    if (globalEnv) return globalEnv;

    return undefined;
  } catch { return undefined; }
};

export const authService = {
  async signIn(password: string) {
    return api.call(async () => {
      const secureKey = getEnv("ADMIN_ACCESS_KEY");
      
      if (!secureKey) {
        throw { 
          status: 500, 
          message: "SYSTEM ERROR: ADMIN ACCESS KEY NOT CONFIGURED IN VERCEL DASHBOARD." 
        };
      }

      if (password === secureKey) {
        const payload = { 
          role: 'ADMIN', 
          iat: Date.now(), 
          exp: Date.now() + (1000 * 60 * 60 * 24) 
        };
        const token = `neuron_auth_v2_${btoa(JSON.stringify(payload))}`;
        sessionStorage.setItem('neuron_session_token', token);
        return { user: { name: 'Admin', role: 'ADMIN' }, token };
      }
      throw { status: 401, message: "Invalid access sequence. Check credentials." };
    });
  },

  async getSession() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token || !token.startsWith('neuron_auth_v2_')) return null;
    try {
      const payload = JSON.parse(atob(token.replace('neuron_auth_v2_', '')));
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
