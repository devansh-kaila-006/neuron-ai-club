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
// Fix: Always use import {GoogleGenAI} from "@google/genai";
import { GoogleGenAI } from "@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-neural-auth, x-neuron-client',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // NOTE: We no longer gate the AI Assistant behind the ADMIN_HASH 
    // to allow public interaction on the landing page. 
    // Sensitive functions (Email/Payment) remain shielded.

    const body = await req.json();
    const { prompt, history = [] } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Validation Error: Prompt is empty." }), { status: 400, headers: corsHeaders });
    }

    // API KEY MANAGEMENT
    const rawKeys = (globalThis as any).Deno.env.get("API_KEY") || "";
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      console.error("CONFIGURATION ERROR: API_KEY missing.");
      return new Response(JSON.stringify({ error: "Neural Grid Failure: API keys not found." }), { status: 500, headers: corsHeaders });
    }

    let lastErrorMsg = "Unknown Error";

    // Attempt generation with available keys
    for (const currentKey of apiKeys) {
      try {
        // Fix: Use named parameter for GoogleGenAI initialization and process.env.API_KEY directly
        (globalThis as any).process.env.API_KEY = currentKey;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Fix: Use gemini-3-pro-preview for complex reasoning and technical assistance tasks
        const result = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: "You are the NEURØN Neural Assistant. Be concise, professional, and technical. You assist with the TALOS 2026 AI hackathon at Amrita University. If technical implementation is requested, provide robust and secure code examples.",
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            tools: [{ googleSearch: {} }] 
          },
        });

        if (!result || !result.candidates || result.candidates.length === 0) {
           throw new Error("Uplink returned empty candidate pool.");
        }

        // Fix: Access .text property directly as a property (not a method)
        const textOutput = result.text || "Uplink returned empty state.";
        
        // Fix: Correct extraction of grounding metadata for search results
        const metadata = result.candidates[0]?.groundingMetadata;
        const chunks = metadata?.groundingChunks || [];
        const sources = chunks.map((chunk: any) => {
          if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title };
          if (chunk.maps) return { uri: chunk.maps.uri, title: chunk.maps.title };
          return null;
        }).filter(Boolean);

        return new Response(
          JSON.stringify({ text: textOutput, sources }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err) {
        lastErrorMsg = err.message;
        console.warn(`Uplink Key Segment [${currentKey.substring(0, 4)}...] Failed: ${err.message}`);
        continue; 
      }
    }

    return new Response(
      JSON.stringify({ error: `Neural Exhaustion: ${lastErrorMsg}` }),
      { status: 503, headers: corsHeaders }
    );

  } catch (error) {
    console.error("FATAL RUNTIME ERROR:", error);
    return new Response(
      JSON.stringify({ error: "Internal Neural Error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
