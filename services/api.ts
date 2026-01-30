import { ApiResponse } from '../lib/types.ts';

export const api = {
  async call<T>(handler: () => Promise<T>): Promise<ApiResponse<T>> {
    try {
      const latency = Math.floor(Math.random() * 300) + 200;
      await new Promise(resolve => setTimeout(resolve, latency));
      const result = await handler();
      return { success: true, data: result, status: 200 };
    } catch (err: any) {
      console.error("[Service Error]:", err);
      return { success: false, error: err.message || "Internal Server Error", status: err.status || 500 };
    }
  }
};