
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// NEURØN Environment Bridge: Shim process.env for Deno runtime
const process = {
  // Fix: Access Deno through globalThis to resolve environment name resolution issues
  env: (globalThis as any).Deno.env.toObject()
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, history } = await req.json()
    
    /**
     * NEURØN High-Availability Protocol:
     * Support for 4 rotated Gemini keys provided as a comma-separated string in the API_KEY secret.
     */
    const keysString = process.env.API_KEY || "";
    const apiKeys = keysString.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);

    if (apiKeys.length === 0) {
      throw new Error("Neural Grid Failure: No Gemini API keys detected. Ensure 'API_KEY' is configured in Supabase secrets.");
    }

    let lastError = null;
    let finalResponse = null;

    // Sequence through the available keys to bypass rate limits (Rotation Logic)
    for (const apiKey of apiKeys) {
      try {
        // Create new instance per attempt to ensure fresh state
        const ai = new GoogleGenAI({ apiKey });
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
          break; // Successful uplink established
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Neural Uplink] Rotation triggered. Key failure: ${err.message}`);
        continue;
      }
    }

    if (!finalResponse) {
      throw lastError || new Error("Neural Grid Exhausted: All available uplink channels failed.");
    }

    // Access .text property directly (not as a method)
    const generatedText = finalResponse.text || "Neural Link Error: No data received.";
    
    // Extract search grounding metadata for UI attribution
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
