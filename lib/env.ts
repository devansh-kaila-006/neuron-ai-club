
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
      // Fallback for direct global process access if shimmed
      if ((process as any).env?.[viteKey]) return (process as any).env[viteKey];
      if ((process as any).env?.[key]) return (process as any).env[key];
    }
  } catch (e) {
    // Silent fail for environments with strict scope access
  }

  return undefined;
};
