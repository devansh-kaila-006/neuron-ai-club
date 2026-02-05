import { api } from './api.ts';
import { supabase, generateSecureID } from '../lib/storage.ts';
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
        // REMOVED: order_id. It must be created via server-side API to be valid.
        handler: options.onSuccess,
        // Simplified notes to stay under 256 char limit per field
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

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { orderId, paymentId, signature, teamData }
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || "Security Breach: Neural payment verification failed.");
      }

      return data;
    });
  }
};