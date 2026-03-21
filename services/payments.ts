
import { api } from './api.ts';
import { supabase } from '../lib/storage.ts';
import { Team } from '../lib/types.ts';
import { getEnv } from '../lib/env.ts';
import { authService } from './auth.ts';

declare global {
  interface Window {
    Razorpay: any;
    grecaptcha: any;
  }
}

const RAZORPAY_KEY_ID = getEnv("RAZORPAY_KEY_ID");
const RAZORPAY_PAYMENT_PAGE_URL = "https://rzp.io/rzp/42RvBVjR";

export const paymentService = {
  async checkout(options: { 
    teamName: string, 
    members: any[],
    email: string, 
    phone: string, 
    onSuccess: (response: any) => void 
  }) {
    // If we have a direct payment page URL, we can redirect or open it
    // However, to maintain the app flow, we'll try to use the modal if possible, 
    // but the user explicitly asked to use the rzp.io link.
    window.open(RAZORPAY_PAYMENT_PAGE_URL, '_blank');
    return { status: 'redirected' };
  },

  async paymentVerify(orderId: string | undefined | null, paymentId: string, signature: string | undefined | null, teamData: Partial<Team>, captchaToken?: string) {
    return api.call(async () => {
      if (!supabase) throw new Error("Neural Grid Offline.");

      // For normal users, this is null. For admins, it's the session hash.
      const sessionHash = authService.getStoredHash();

      // Ensure we don't pass string "null" or "undefined"
      const payload = { 
        orderId: orderId || null, 
        paymentId, 
        signature: signature || null, 
        teamData, 
        captchaToken: captchaToken || null 
      };

      const { data, error } = await supabase.functions.invoke('payment-verify', {
        body: payload,
        headers: {
          'x-neural-auth': sessionHash || ''
        }
      });
      
      if (error) {
        console.error("Grid Sync Link Error:", error);
        let errorMsg = "Neural Verification Sequence Failed.";
        try {
          // Attempt to extract structured error from the response context
          const context = await error.context?.json();
          errorMsg = context?.error || context?.details || error.message;
        } catch { 
          errorMsg = error.message;
        }
        throw new Error(errorMsg);
      }

      if (!data || data.success === false) {
        console.warn("Verification Rejected Payload:", data);
        throw new Error(data?.error || data?.details || "Neural verification sequence rejected.");
      }

      return data.data as Team;
    });
  }
};
