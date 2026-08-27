import { GoogleGenAI } from "@google/genai";

const googleGeminiClient = () => {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    return ai;
  } catch (error) {
    console.log(error.message);
    return 0;
  }
};
export default googleGeminiClient;
