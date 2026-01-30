
import { api } from './api.ts';

const getEnv = (key: string): string | undefined => {
  try {
    return (window as any).process?.env?.[key] || (globalThis as any).process?.env?.[key];
  } catch { return undefined; }
};

export const authService = {
  async signIn(password: string) {
    return api.call(async () => {
      const secureKey = getEnv("ADMIN_ACCESS_KEY");
      
      if (!secureKey) {
        throw { status: 500, message: "System Error: Admin Access Key not configured in environment." };
      }

      if (password === secureKey) {
        const payload = { 
          role: 'ADMIN', 
          iat: Date.now(), 
          exp: Date.now() + (1000 * 60 * 60 * 24) 
        };
        // Use a secure prefix to prevent collisions with other local tokens
        const token = `neuron_auth_v2_${btoa(JSON.stringify(payload))}`;
        sessionStorage.setItem('neuron_session_token', token);
        return { user: { name: 'Admin', role: 'ADMIN' }, token };
      }
      throw { status: 401, message: "Access Denied: Invalid Security Sequence" };
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
