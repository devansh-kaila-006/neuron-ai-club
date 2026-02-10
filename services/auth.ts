
import { api } from './api.ts';
import CryptoJS from 'crypto-js';
import { getEnv } from '../lib/env.ts';

export const authService = {
  /**
   * Neural Authentication Gateway
   * Verifies the provided credentials against the hashed system key.
   * Implements secure signed session tokens to prevent forgery.
   */
  async signIn(password: string) {
    return api.call(async () => {
      // SECURITY: Compute the SHA-256 hash of the input
      const inputHash = CryptoJS.SHA256(password).toString();
      
      // Retrieve the master hash and a signing secret from environment
      const adminHash = getEnv('ADMIN_HASH');
      // For signing, we combine the admin hash with the session logic to create a unique fingerprint
      if (!adminHash) {
        console.error("NEURØN Security Breach: VITE_ADMIN_HASH is not configured.");
        throw new Error("System lockdown: Admin gateway is not initialized.");
      }

      if (inputHash !== adminHash) {
        throw new Error("Invalid access key: Authorization sequence rejected.");
      }
      
      // Create a payload with expiration
      const data = { 
        role: 'ADMIN', 
        hash: inputHash, 
        iat: Date.now(), 
        exp: Date.now() + (1000 * 60 * 60 * 12) 
      };

      // CRYPTOGRAPHIC SIGNING: Prevent token forgery by signing the payload
      const signature = CryptoJS.HmacSHA256(JSON.stringify(data), adminHash).toString();
      const signedPayload = { ...data, sig: signature };

      // Generate a b64 encoded token
      const token = `neuron_auth_v7_${btoa(JSON.stringify(signedPayload))}`;
      sessionStorage.setItem('neuron_session_token', token);
      
      return { user: { name: 'Admin', role: 'ADMIN' }, token };
    });
  },

  getStoredHash() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token || !token.startsWith('neuron_auth_v7_')) return null;
    try {
      const signedPayload = JSON.parse(atob(token.replace('neuron_auth_v7_', '')));
      const { sig, ...data } = signedPayload;
      
      const adminHash = getEnv('ADMIN_HASH');
      if (!adminHash) return null;

      // Verify integrity of the token via signature check
      const expectedSignature = CryptoJS.HmacSHA256(JSON.stringify(data), adminHash).toString();
      if (sig !== expectedSignature) {
        console.warn("Security Alert: Session Token Forgery Detected.");
        sessionStorage.removeItem('neuron_session_token');
        return null;
      }

      // Expiration check
      if (data.exp < Date.now()) {
        sessionStorage.removeItem('neuron_session_token');
        return null;
      }
      return data.hash;
    } catch { return null; }
  },

  async getSession() {
    const token = sessionStorage.getItem('neuron_session_token');
    if (!token || !token.startsWith('neuron_auth_v7_')) return null;
    try {
      const signedPayload = JSON.parse(atob(token.replace('neuron_auth_v7_', '')));
      const { sig, ...data } = signedPayload;
      
      const adminHash = getEnv('ADMIN_HASH');
      if (!adminHash) return null;

      const expectedSignature = CryptoJS.HmacSHA256(JSON.stringify(data), adminHash).toString();
      if (sig !== expectedSignature || data.exp < Date.now()) {
        sessionStorage.removeItem('neuron_session_token');
        return null;
      }
      return data;
    } catch { return null; }
  },

  async signOut() {
    sessionStorage.removeItem('neuron_session_token');
  }
};
