// 1. NEURØN Global Security & Environment Shim
const envStore: Record<string, string> = {};
(globalThis as any).process = {
  env: new Proxy({}, {
    get: (_, prop: string) => envStore[prop] || (globalThis as any).Deno.env.get(prop),
    set: (_, prop: string, value: string) => {
      envStore[prop] = value;
      return true;
    }
  })
} as any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Use the explicit esm.sh URL for Deno/Supabase Edge Function compatibility
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.3.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-neural-auth',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SECURITY FIX: Fail-Closed Authorization
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const clientAuth = req.headers.get('x-neural-auth');
    
    if (!adminHash) {
      console.error("CRITICAL: ADMIN_HASH secret missing in Supabase environment.");
      return new Response(JSON.stringify({ error: "System Configuration Error" }), { status: 500, headers: corsHeaders });
    }

    if (clientAuth !== adminHash) {
      console.warn("Security Alert: Unauthorized access attempt blocked.");
      return new Response(JSON.stringify({ error: "Access Denied: Neural Link identity mismatch." }), { status: 401, headers: corsHeaders });
    }

    const { prompt, history = [] } = await req.json();

    if (!prompt) {
      throw new Error("Neural Error: No prompt detected.");
    }

    const rawKeys = (globalThis as any).Deno.env.get("API_KEY") || "";
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      throw new Error("Neural Grid Failure: API_KEY not found.");
    }

    let lastError = null;

    for (const currentKey of apiKeys) {
      try {
        (globalThis as any).process.env.API_KEY = currentKey;
        // Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Use gemini-3-pro-preview for complex technical and hackathon tasks
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: "You are the NEURØN Neural Assistant. Be concise, technical, and helpful. You are assisting with the TALOS 2026 hackathon.",
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            tools: [{ googleSearch: {} }] 
          },
        });

        // The GenerateContentResponse object features a text property (not a method)
        const textOutput = response.text || "Uplink returned empty state.";
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
          uri: chunk.web?.uri || chunk.maps?.uri,
          title: chunk.web?.title || chunk.maps?.title || "Reference"
        })).filter((s: any) => s.uri) || [];

        return new Response(
          JSON.stringify({ text: textOutput, sources }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err) {
        lastError = err;
        continue;
      }
    }

    throw lastError || new Error("Uplink capacity reached.");

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Neural Error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})