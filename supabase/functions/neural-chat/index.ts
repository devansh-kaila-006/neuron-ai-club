
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai@1.3.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// NEURØN Universal Environment Shim for Deno
// Fix: Use (globalThis as any).Deno to avoid "Cannot find name 'Deno'" linter errors in some environments
const process = {
  env: new Proxy({}, {
    get: (_target, prop: string) => (globalThis as any).Deno.env.get(prop)
  })
} as any;

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, history = [] } = body;

    if (!prompt) {
      throw new Error("Neural Error: No prompt provided in request body.");
    }

    // Following @google/genai guidelines: Always use direct process.env.API_KEY initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Correct method: Use ai.models.generateContent with both model name and prompt/history
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
    
    // Extract text output using the correct .text property (not a method)
    const generatedText = response.text || "Neural Link Error: The model returned an empty response.";
    
    // Extract search grounding metadata (Grounding Chunks) if available
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || chunk.maps?.uri,
      title: chunk.web?.title || chunk.maps?.title || "Reference Source"
    })).filter((s: any) => s.uri) || [];

    return new Response(
      JSON.stringify({ text: generatedText, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Neural Unit Critical Failure:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Neural Error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
