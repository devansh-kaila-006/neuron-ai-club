
import { GoogleGenAI } from "@google/genai";

const getEnv = (key: string): string | undefined => {
  try {
    return (window as any).process?.env?.[key] || 
           (import.meta as any).env?.[`VITE_${key}`] || 
           (import.meta as any).env?.[key] ||
           (globalThis as any).process?.env?.[key];
  } catch { return undefined; }
};

const SYSTEM_INSTRUCTION = `You are the NEURØN Neural Assistant for the Amrita AI/ML Club. 
Your mission is to assist students with queries regarding the club and the TALOS Hackathon.

ABOUT NEURØN:
NEURØN is Amrita Vishwa Vidyapeetham’s dedicated Artificial Intelligence Community of Practice (CoP). 
Tagline: "Built by students. Driven by curiosity. Powered by AI."

VISION:
To establish a strong, inclusive, and innovative AI ecosystem at Amrita that empowers students to become skilled AI practitioners, researchers, and responsible technology leaders.

MISSION:
- Learn AI concepts through practical exposure.
- Apply AI across diverse domains.
- Share knowledge and experiences.
- Innovate responsibly and ethically.

OBJECTIVES:
1. Create awareness and interest in AI.
2. Provide foundational and advanced AI knowledge.
3. Enable hands-on learning through projects and labs.
4. Promote interdisciplinary AI applications.
5. Encourage innovation.
6. Prepare students for AI-related careers and research.

FLAGSHIP EVENT: 
TALOS (Overnight AI Hackathon). 
Features: Open to all branches, Beginner-friendly, Real-world problem statements, Final pitch and demo.
Fee: ₹499 per team (2-4 members).

Tone: Cybernetic, professional, futuristic. Use Google Search for recent technical info.`;

export interface NeuralResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

export interface MessageHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const getNeuralResponse = async (prompt: string, history: MessageHistory[] = []): Promise<NeuralResponse> => {
  try {
    const apiKey = getEnv("API_KEY");
    if (!apiKey) throw new Error("Neural Uplink: API_KEY missing.");
    
    const ai = new GoogleGenAI({ apiKey });
    const contents = [...history, { role: 'user', parts: [{ text: prompt }] }];
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }] 
      },
    });
    
    const text = response.text || "I am processing your request...";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ 
        uri: c.web.uri, 
        title: c.web.title 
      }));
      
    return { text, sources };
  } catch (err) {
    console.error("Neural Error:", err);
    return { text: "Neural Link Error: The uplink is currently unstable." };
  }
};
