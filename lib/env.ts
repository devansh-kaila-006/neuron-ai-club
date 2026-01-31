
/**
 * NEURØN Environment Proxy
 * Consolidates environment variable access across Vite, Process, and Global scopes.
 */
export const getEnv = (key: string): string | undefined => {
  const viteKey = `VITE_${key}`;
  
  try {
    // 1. Check Vite Meta Env (Standard for ESM/Vite)
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      if (metaEnv[viteKey]) return metaEnv[viteKey];
      if (metaEnv[key]) return metaEnv[key];
    }

    // 2. Check Window Process Shim (Common in sandboxed environments)
    if (typeof window !== 'undefined' && (window as any).process?.env) {
      const env = (window as any).process.env;
      if (env[viteKey]) return env[viteKey];
      if (env[key]) return env[key];
    }

    // 3. Check Global Process (Node-like environments)
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[viteKey]) return process.env[viteKey];
      if (process.env[key]) return process.env[key];
    }
  } catch (e) {
    // Silent fail for environments with strict scope access
  }

  return undefined;
};
