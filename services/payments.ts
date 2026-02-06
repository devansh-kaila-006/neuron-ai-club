
import { api } from './api.ts';
import { supabase } from '../lib/storage.ts';
import { Team } from '../lib/types.ts';
import { getEnv } from '../lib/env.ts';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_KEY_ID = getEnv("RAZORPAY_KEY_ID");

export const paymentService = {
  async checkout(options: { 
    teamName: string, 
    members: any[],
    email: string, 
    phone: string, 
    onSuccess: (response: any) => void 
  }) {
    return api.call(async () => {
      if (!RAZORPAY_KEY_ID) throw new Error("Payment Gateway Offline: Key ID missing.");
      
      const amountInPaise = 1 * 100; // TEST AMOUNT: ₹1 (100 Paise)

      const rzpOptions = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "NEURØN Core",
        description: `TALOS 2026 Registry - ${options.teamName}`,
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200",
        handler: options.onSuccess,
        notes: {
          teamName: options.teamName,
          leadEmail: options.email,
          memberCount: options.members.length.toString()
        },
        prefill: {
          name: options.teamName,
          email: options.email,
          contact: options.phone
        },
        theme: { color: "#4f46e5" },
        modal: { ondismiss: () => console.log("Payment dismissed.") }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
      return { status: 'initiated' };
    });
  },

  async verifyPayment(orderId: string | undefined, paymentId: string, signature: string | undefined, teamData: Partial<Team>) {
    return api.call(async () => {
      if (!supabase) throw new Error("Neural Grid Offline.");

      const adminHash = getEnv("ADMIN_HASH");

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { orderId, paymentId, signature, teamData },
        headers: {
          'x-neural-auth': adminHash || ''
        }
      });
      
      if (error) {
        let errorMsg = error.message;
        try {
          // Attempt to extract detailed error from Edge Function response
          const errorContext = await error.context?.json();
          if (errorContext?.error) {
            errorMsg = errorContext.error;
            if (errorContext.details) {
              console.warn(`Neural Diagnostic: ${errorContext.details}`);
              errorMsg += ` (${errorContext.details})`;
            }
          }
        } catch { /* use original message */ }
        throw new Error(errorMsg);
      }

      if (!data || !data.success) {
        const serverError = data?.error || "Neural verification sequence rejected.";
        const details = data?.details ? ` - ${data.details}` : "";
        throw new Error(serverError + details);
      }

      return data.data as Team;
    });
  }
};
