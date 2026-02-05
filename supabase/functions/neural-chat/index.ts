
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI } from "https://esm.sh/@google/genai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fixed: Removed Deno shim for process.env as per GenAI guidelines and to fix "Cannot find name 'Deno'" error.
// Use process.env.API_KEY directly as it is assumed to be available in the execution context.

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, history } = await req.json()
    
    // Fixed: Always use the named parameter for apiKey and use process.env.API_KEY directly.
    // The API key is obtained exclusively from the environment variable process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fixed: Using 'gemini-3-flash-preview' for general text and Q&A tasks as per guidelines.
    // Fixed: Using ai.models.generateContent directly with both model name and contents.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the NEURØN Neural Assistant, an elite AI entity representing the Amrita AI/ML Club. You are professional, concise, and technically sophisticated. Use bold for critical terms. Provide real-time data when asked using your grounded tools. You are currently deployed to the TALOS 2026 hackathon grid.",
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        tools: [{ googleSearch: {} }] 
      },
    });
    
    // Fixed: Directly access the .text property of the GenerateContentResponse (not as a method).
    const generatedText = response.text || "Neural Link Error: No response generated.";
    
    // Fixed: Extract grounding metadata sources to display links on the web app as required by search grounding rules.
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || chunk.maps?.uri,
      title: chunk.web?.title || chunk.maps?.title || "Reference Source"
    })).filter((s: any) => s.uri) || [];

    return new Response(
      JSON.stringify({ text: generatedText, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Neural Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
