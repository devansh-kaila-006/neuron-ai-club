
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.3.0?target=deno"

// NEURØN Global Environment Bridge
// Ensures 'process' is available globally for the GenAI SDK
const denoEnv = (globalThis as any).Deno.env.toObject();
(globalThis as any).process = {
  env: denoEnv
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const rawBody = await req.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      throw new Error("Neural Error: Invalid JSON payload.");
    }

    const { prompt, history = [] } = body;
    if (!prompt) {
      throw new Error("Neural Error: Prompt is required.");
    }

    /**
     * NEURØN High-Availability Protocol:
     * Support for rotated Gemini keys provided as a comma-separated string in the API_KEY secret.
     */
    const rawApiKey = (globalThis as any).process.env.API_KEY || "";
    const apiKeys = rawApiKey.split(',').map((k: string) => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
      throw new Error("Neural Grid Failure: API_KEY secret is not configured in Supabase.");
    }

    let lastError = null;
    let finalResponse = null;

    // Sequence through the available keys (Rotation/Failover Logic)
    for (const key of apiKeys) {
      try {
        // Explicitly set the current key to process.env.API_KEY to satisfy SDK requirements
        (globalThis as any).process.env.API_KEY = key;
        
        const ai = new GoogleGenAI({ apiKey: (globalThis as any).process.env.API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: "You are the NEURØN Neural Assistant, an elite AI entity for the Amrita AI/ML Club. You are professional, technically sophisticated, and helpful. Use bold for critical terms. Provide real-time data using search tools when requested. You are helping students with TALOS 2026, an overnight hackathon.",
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            tools: [{ googleSearch: {} }] 
          },
        });
        
        if (response) {
          finalResponse = response;
          break; 
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Neural Uplink] Channel failure: ${err.message}. Rotating...`);
        continue;
      }
    }

    if (!finalResponse) {
      throw lastError || new Error("Neural Grid Exhausted: All uplink channels failed.");
    }

    // Direct property access as per @google/genai guidelines
    const generatedText = finalResponse.text || "Neural Link Error: No content returned.";
    
    // Extract grounding sources for attribution
    const sources = finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || chunk.maps?.uri,
      title: chunk.web?.title || chunk.maps?.title || "Reference Source"
    })).filter((s: any) => s.uri) || [];

    return new Response(
      JSON.stringify({ text: generatedText, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Neural Unit Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check Supabase Edge Function logs for stack trace." 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
