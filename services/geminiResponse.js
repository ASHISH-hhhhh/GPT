import googleGeminiClient from "../config/geminiClient.js";

const geminiResponse = async (config, chatContext) => {
  try {
    let response = null;
    if (chatContext.length <= 0) {
      return { status: 0, message: "Please send the proper chat context" };
    }
    const ai = googleGeminiClient();
    if (!ai) {
      return { status: 0, message: "Failed to connect with the gemini client" };
    }
    if (!config) {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: chatContext,
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        config: {
          systemInstruction: config,
        },
        contents: chatContext,
      });
    }

    return {
      status: 1,
      message: response.candidates[0].content.parts[0].text,
      promptToken: response.usageMetadata.promptTokenCount,
      responseToken: response.usageMetadata.candidatesTokenCount,
      totalPromptResponseTokenCount: response.usageMetadata.totalTokenCount,
      modelUsed: response.modelVersion,
    };
  } catch (error) {
    console.log(error.message);
    return { status: 0, message: error.message };
  }
};
export default geminiResponse;
