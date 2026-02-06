
import { ApiResponse } from '../lib/types.ts';

export const api = {
  async call<T>(handler: () => Promise<T>): Promise<ApiResponse<T>> {
    try {
      const latency = Math.floor(Math.random() * 300) + 200;
      await new Promise(resolve => setTimeout(resolve, latency));
      const result = await handler();
      return { success: true, data: result, status: 200 };
    } catch (err: any) {
      // SECURITY FIX: Sanitize logs. Do not stringify the raw error object to the console
      // as it may contain Supabase internal URLs or database schema details.
      const sanitizedMessage = err.message || (typeof err === 'string' ? err : "Neural Link Error: Request terminated.");
      console.error("[Service Error]:", sanitizedMessage);
      
      return { 
        success: false, 
        error: sanitizedMessage, 
        status: err.status || 500 
      };
    }
  }
};