
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * NEURØN Environment Bridge
 * Satisfies the requirement to use process.env.API_KEY in a Deno environment.
 */
const process = {
  env: new Proxy({}, {
    get: (_target, prop: string) => (globalThis as any).Deno?.env.get(prop)
  })
} as any;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    const { prompt, history = [] } = body;
    
    // Obtain the API_KEY string exclusively from process.env.API_KEY
    const rawKeys = process.env.API_KEY || "";
    
    // Support for 4 rotated keys (comma-separated) to bypass rate limits (Rotation Logic)
    const apiKeys = rawKeys.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);

    if (apiKeys.length === 0) {
      throw new Error("Neural Grid Failure: No Gemini API keys detected in process.env.API_KEY.");
    }

    let lastError = null;
    let finalResponse = null;

    // Sequence through the available keys
    for (const apiKey of apiKeys) {
      try {
        // Create a new instance right before the call to ensure the latest key is used
        const ai = new GoogleGenAI({ apiKey });
        
        // Call generateContent with both model name and contents
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: "You are the NEURØN Neural Assistant for the Amrita AI/ML Club. You are an elite AI entity. You are professional, technically sophisticated, and helpful. Use bold for critical terms. Provide real-time data using search tools when requested. You are helping students with TALOS 2026, an overnight hackathon.",
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
        console.warn(`[Neural Uplink] Channel rotation triggered. Key failure: ${err.message}`);
        continue; // Try next key in rotation
      }
    }

    if (!finalResponse) {
      throw lastError || new Error("Neural Grid Exhausted: All available uplink channels failed.");
    }

    // Access .text property directly as per GenAI coding guidelines
    const generatedText = finalResponse.text || "Neural Link Error: No data received.";
    
    // Extract search grounding metadata for UI attribution as required by search grounding rules
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
