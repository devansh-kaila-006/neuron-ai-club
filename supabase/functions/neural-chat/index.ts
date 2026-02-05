
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    
    // Support multiple keys for rotation (comma-separated in process.env.API_KEY)
    const keysString = process.env.API_KEY || "";
    const apiKeys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (apiKeys.length === 0) {
      throw new Error("Neural Grid Failure: No Gemini API keys detected in the encryption grid.");
    }

    let lastError = null;
    let finalResponse = null;

    // Implementation of high-availability key rotation logic
    for (const apiKey of apiKeys) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Using 'gemini-flash-lite-latest' (Gemini 2.5 Flash-Lite) as requested
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
        
        if (response) {
          finalResponse = response;
          break; // Successful uplink, exit rotation loop
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Neural Assistant] Sequence 429/Error detected. Rotating keys... Error: ${err.message}`);
        // Continue to next key in case of rate limits or transient errors
        continue;
      }
    }

    if (!finalResponse) {
      throw new Error(`Neural Grid Exhausted: All ${apiKeys.length} keys failed. Last error: ${lastError?.message}`);
    }

    // Access .text property directly
    const generatedText = finalResponse.text || "Neural Link Error: No response generated.";
    
    // Extract grounding chunks for accurate citations
    const sources = finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
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
