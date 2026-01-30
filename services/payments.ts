
import CryptoJS from 'crypto-js';
import { api } from './api.ts';
import { storage, generateSecureID } from '../lib/storage.ts';
import { Team, PaymentStatus } from '../lib/types.ts';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const getEnv = (key: string): string | undefined => {
  try {
    return (window as any).process?.env?.[key] || (globalThis as any).process?.env?.[key];
  } catch { return undefined; }
};

const RAZORPAY_SECRET = getEnv("RAZORPAY_SECRET");
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
      
      const amount = 499 * 100;
      const order = {
        id: `order_${generateSecureID('', 12)}`,
        amount: amount,
        currency: "INR"
      };

      const rzpOptions = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "NEURØN Core",
        description: `TALOS 2025 Registry - ${options.teamName}`,
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200",
        order_id: order.id,
        handler: options.onSuccess,
        prefill: {
          name: options.teamName,
          email: options.email,
          contact: options.phone
        },
        theme: {
          color: "#4f46e5"
        },
        modal: {
          ondismiss: () => console.log("Payment dismissed.")
        }
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
      return { orderId: order.id };
    });
  },

  async verifyPayment(orderId: string, paymentId: string, signature: string, teamData: Partial<Team>) {
    return api.call(async () => {
      if (!RAZORPAY_SECRET) throw new Error("Security Error: Secret verification key unavailable.");

      // Production HMAC Verification
      const expectedSignature = CryptoJS.HmacSHA256(`${orderId}|${paymentId}`, RAZORPAY_SECRET).toString();
      
      // Enforced Security: No bypass allowed
      if (signature !== expectedSignature) {
        console.error("[Security Violation] Invalid Payment Signature Attempted");
        throw new Error("Security Breach: Neural payment verification failed. This incident has been logged.");
      }

      const newTeam: Team = {
        id: generateSecureID('', 10),
        teamName: teamData.teamName!,
        teamID: generateSecureID('TALOS', 4),
        members: teamData.members!,
        leadEmail: teamData.leadEmail!,
        paymentStatus: PaymentStatus.PAID,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        checkedIn: false,
        registeredAt: Date.now()
      };

      await storage.saveTeam(newTeam);
      return newTeam;
    });
  }
};
