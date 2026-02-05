
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Always use import {GoogleGenAI} from "@google/genai"; as per guidelines
import { GoogleGenAI } from "@google/genai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, history } = await req.json()
    
    // Always use process.env.API_KEY directly as per GenAI guidelines.
    // This also fixes the "Cannot find name 'Deno'" error in Supabase functions by using the pre-configured environment variable.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using 'gemini-flash-lite-latest' (Gemini 2.5 Flash-Lite)
    // Directly calling ai.models.generateContent with both model name and prompt/contents.
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are the NEURØN Neural Assistant, an elite AI entity representing the Amrita AI/ML Club. You are professional, concise, and technically sophisticated. Use bold for critical terms. Provide real-time data when asked using your grounded tools. You are currently deployed to the TALOS 2026 hackathon grid.",
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        tools: [{ googleSearch: {} }] 
      },
    });

    if (!response) {
      throw new Error("Neural Grid Exhausted: Uplink failed.");
    }

    // Access .text property directly (not a method) as per guidelines.
    const generatedText = response.text || "Neural Link Error: No response generated.";
    
    // Extract grounding chunks for accurate citations from the groundingMetadata.
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
