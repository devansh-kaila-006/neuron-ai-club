
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
    email: string, 
    phone: string, 
    onSuccess: (response: any) => void 
  }) {
    return api.call(async () => {
      if (!RAZORPAY_KEY_ID) throw new Error("Payment Gateway Offline: Key ID missing.");
      
      const order = {
        id: `order_${generateSecureID('', 12)}`,
        amount: 499 * 100,
        currency: "INR"
      };

      const rzpOptions = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "NEURØN Core",
        description: `TALOS 2026 Registry - ${options.teamName}`,
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200",
        order_id: order.id,
        handler: options.onSuccess,
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
      return { orderId: order.id };
    });
  },

  /**
   * Secure Backend Verification
   * Calls the 'verify-payment' Supabase function which holds the RAZORPAY_SECRET.
   */
  async verifyPayment(orderId: string, paymentId: string, signature: string, teamData: Partial<Team>) {
    return api.call(async () => {
      if (!supabase) throw new Error("Neural Grid Offline.");

      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { orderId, paymentId, signature, teamData }
      });
      
      if (error || !data.success) {
        console.error("[Security Violation] Backend verification rejected the signature.");
        throw new Error(error?.message || "Security Breach: Neural payment verification failed.");
      }

      return data;
    });
  }
};
