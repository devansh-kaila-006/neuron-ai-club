
import { getEnv } from './env.ts';

/**
 * NEURØN reCAPTCHA Initialization Utility
 * Dynamically loads the reCAPTCHA v3 script to prevent "key not loaded" errors.
 */
let loadPromise: Promise<void> | null = null;

export const loadRecaptcha = (): Promise<void> => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const siteKey = getEnv('RECAPTCHA_SITE_KEY');
    if (!siteKey) {
      console.warn("NEURØN Security: reCAPTCHA site key missing. Verification will likely fail.");
      resolve();
      return;
    }

    if ((window as any).grecaptcha) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).grecaptcha.ready(() => resolve());
    };
    script.onerror = () => reject(new Error("reCAPTCHA failed to load."));
    document.head.appendChild(script);
  });

  return loadPromise;
};

export const executeRecaptcha = async (action: string): Promise<string> => {
  const siteKey = getEnv('RECAPTCHA_SITE_KEY');
  if (!siteKey) return '';

  await loadRecaptcha();
  
  const grecaptcha = (window as any).grecaptcha;
  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(siteKey, { action })
        .then(resolve)
        .catch(reject);
    });
  });
};
