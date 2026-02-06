
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
// Always use the explicit esm.sh URL for Deno/Supabase Edge Function compatibility
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.3.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-neural-auth, x-neuron-client',
}

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const adminHash = (globalThis as any).Deno.env.get("ADMIN_HASH");
    const clientAuth = req.headers.get('x-neural-auth');
    
    // 1. SECURITY: Fail-Closed Authorization
    if (!adminHash) {
      console.error("CRITICAL: ADMIN_HASH secret missing in Supabase secrets.");
      return new Response(JSON.stringify({ error: "System Configuration Error: Missing ADMIN_HASH" }), { status: 500, headers: corsHeaders });
    }

    if (clientAuth !== adminHash) {
      console.warn("Security Alert: Unauthorized access attempt blocked. Identity mismatch.");
      return new Response(JSON.stringify({ error: "Access Denied: Neural Link identity mismatch." }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { prompt, history = [] } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Neural Error: No prompt detected in request body." }), { status: 400, headers: corsHeaders });
    }

    // 2. API KEY MANAGEMENT: Retrieve and validate keys
    const rawKeys = (globalThis as any).Deno.env.get("API_KEY") || "";
    const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      console.error("CRITICAL: API_KEY secret is empty or missing in Supabase.");
      return new Response(JSON.stringify({ error: "Neural Grid Failure: API_KEY not found in system secrets." }), { status: 500, headers: corsHeaders });
    }

    let lastError = null;

    // 3. ROTATION LOGIC: Attempt keys until success or exhaustion
    for (const currentKey of apiKeys) {
      try {
        (globalThis as any).process.env.API_KEY = currentKey;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // Use gemini-3-pro-preview for complex technical and hackathon tasks
        // This model supports googleSearch tool.
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: "You are the NEURØN Neural Assistant. Be concise, technical, and helpful. You are assisting students with the TALOS 2026 hackathon. If asked about technical implementation, provide clean, secure code examples.",
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            tools: [{ googleSearch: {} }] 
          },
        });

        // The GenerateContentResponse object features a text property (not a method)
        const textOutput = response.text || "Neural uplink returned empty state.";
        
        // Robust grounding parsing
        const candidates = response.candidates || [];
        const metadata = candidates[0]?.groundingMetadata;
        const chunks = metadata?.groundingChunks || [];
        
        const sources = chunks.map((chunk: any) => ({
          uri: chunk.web?.uri || chunk.maps?.uri,
          title: chunk.web?.title || chunk.maps?.title || "Reference"
        })).filter((s: any) => s.uri);

        console.log(`Neural Success: Prompt processed using key fragment ...${currentKey.slice(-4)}`);

        return new Response(
          JSON.stringify({ text: textOutput, sources }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (err) {
        console.error(`Uplink Key Failure (...${currentKey.slice(-4)}):`, err.message);
        lastError = err;
        // Continue to next key in the pool
        continue;
      }
    }

    // 4. FINAL FAILURE: If all keys fail, report the specific error
    console.error("CRITICAL: All Neural Uplink keys exhausted or failed.");
    return new Response(
      JSON.stringify({ error: `Neural Grid Exhaustion: ${lastError?.message || 'Unknown error'}` }),
      { status: 503, headers: corsHeaders }
    );

  } catch (error) {
    // This block catches JSON parsing errors or other unexpected logic crashes
    console.error("FATAL: Edge Function Runtime Crash:", error);
    return new Response(
      JSON.stringify({ error: "Internal Neural Error: Function runtime failure.", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
