import { GoogleGenAI } from "@google/genai";

const getAiClient = (userKey?: string) => {
  // Only use keys that the user has explicitly provided or injected at build time
  const apiKey = (userKey || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTutorResponse = async (
  query: string,
  context: string,
  userApiKey?: string
): Promise<string> => {
  const ai = getAiClient(userApiKey);
  
  if (!ai) {
    return "AI Assistant is not configured. Please add an API Key in your Settings.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: ${context}\n\nStudent Question: ${query}`,
      config: {
        systemInstruction: "You are a helpful and encouraging engineering teaching assistant. Answer the student's question based on the provided tutorial context. Keep answers concise and technical where appropriate.",
      }
    });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI. Please check your API Key.";
  }
};
