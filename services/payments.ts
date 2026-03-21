
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
const RAZORPAY_PAYMENT_PAGE_BASE_URL = "https://pages.razorpay.com/pl_STlwYmWAYb5zyU/view";

export const paymentService = {
  async checkout(options: { 
    teamName: string, 
    members: any[],
    email: string, 
    phone: string, 
    onSuccess: (response: any) => void 
  }) {
    // 1. Construct the Minified JSON Object (Short Keys)
    const minifiedData = {
      tn: options.teamName,
      le: options.email,
      m: options.members.map(m => ({
        n: m.name,
        e: m.email,
        p: m.phone
      }))
    };

    // 2. Stringify and URL-Encode the JSON
    const encodedTeamData = encodeURIComponent(JSON.stringify(minifiedData));

    // 3. Construct the Final URL
    const finalUrl = `${RAZORPAY_PAYMENT_PAGE_BASE_URL}?email=${encodeURIComponent(options.email)}&phone=${encodeURIComponent(options.phone)}&teamdata=${encodedTeamData}`;

    // 4. Open the URL in a new tab
    window.open(finalUrl, '_blank');
    
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
