// 1. NEURØN Global Security & Environment Shim (Must be first)
const envStore: Record<string, string> = {};
(globalThis as any).process = {
  env: new Proxy({}, {
    // Ensures 'Deno' is accessed via globalThis to prevent ReferenceErrors in the edge runtime
    get: (_, prop: string) => envStore[prop] || (globalThis as any).Deno.env.get(prop),
    set: (_, prop: string, value: string) => {
      envStore[prop] = value;
      return true;
    }
  })
} as any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.3.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, history = [] } = await req.json();

    if (!prompt) {
      throw new Error("Neural Error: No prompt detected in stream.");
    }

    // Access the raw rotated keys from Supabase Secrets
    const rawKeys = (globalThis as any).Deno.env.get("API_KEY") || "";
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      throw new Error("Neural Grid Failure: API_KEY secret not found in environment.");
    }

    let lastError = null;

    // High-Availability Rotation Loop
    for (const currentKey of apiKeys) {
      try {
        // CRITICAL: Explicitly set process.env.API_KEY to satisfy Elite guidelines
        (globalThis as any).process.env.API_KEY = currentKey;

        // Correct Method: Initialize exactly as required by guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
          // FIXED: Using the exact alias for 'flash lite' from guidelines
          model: 'gemini-flash-lite-latest',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: "You are the NEURØN Neural Assistant, an elite AI entity for the Amrita AI/ML Club. You are professional, technically sophisticated, and helpful. Use bold for critical terms. You specialize in rapid, slim-processed reasoning. You are helping students with TALOS 2026, an overnight hackathon.",
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            tools: [{ googleSearch: {} }] 
          },
        });

        // Use direct .text property as required
        const textOutput = response.text || "Neural Link Error: The model returned a null state.";
        
        // Extract grounding chunks for citations
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
        console.warn(`Neural Uplink Interrupted on node ${currentKey.substring(0, 8)}: ${err.message}`);
        continue; // Rotate to next key
      }
    }

    throw lastError || new Error("Neural Grid Saturated: All available uplink nodes are currently offline.");

  } catch (error) {
    console.error("Neural Unit Critical Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal Neural Error",
        type: error.constructor.name 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})