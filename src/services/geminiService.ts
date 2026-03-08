import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Please configure it in your environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export async function getHint(roomTitle: string, taskQuestion: string, userProgress: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `You are a cybersecurity mentor for a platform like TryHackMe. 
      The user is working on a room called "${roomTitle}".
      The current task is: "${taskQuestion}".
      The user is stuck. Provide a subtle, helpful hint without giving away the flag or the direct answer.
      Focus on the methodology (e.g., "Have you checked for hidden directories using gobuster?" or "Look closely at the HTTP headers").
      Keep it concise and encouraging.`,
    });
    return response.text || "No hint available at the moment.";
  } catch (error: any) {
    console.error("Gemini Hint Error:", error);
    return `Error getting hint: ${error.message}`;
  }
}

export async function generateLabDescription(topic: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Generate a compelling, educational description for a new cybersecurity lab room about "${topic}". 
      Include:
      1. A brief background story.
      2. What the user will learn.
      3. Prerequisites.
      Format it in Markdown.`,
    });
    return response.text || "Failed to generate description.";
  } catch (error: any) {
    console.error("Gemini Description Error:", error);
    return `Error generating description: ${error.message}`;
  }
}

export async function chatWithGemini(message: string, history: any[] = []) {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-1.5-pro",
      config: {
        systemInstruction: "You are HackLab AI, a specialized cybersecurity assistant. You help users with lab tasks, explain concepts, and provide guidance on ethical hacking. Always maintain an encouraging and professional tone. Never provide actual flags or direct answers to lab questions unless specifically asked for educational purposes in a controlled context.",
      },
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return `Chat Error: ${error.message}`;
  }
}

export async function analyzeImage(base64Image: string, prompt: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: "image/png" } }
          ]
        }
      ]
    });
    return response.text || "Analysis failed.";
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    return `Vision Error: ${error.message}`;
  }
}

export async function generateImage(prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "1:1") {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
}

export async function generateVideo(prompt: string, imageBase64?: string) {
  try {
    const ai = getAI();
    const config: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    };

    if (imageBase64) {
      config.image = {
        imageBytes: imageBase64,
        mimeType: 'image/png'
      };
    }

    let operation = await ai.models.generateVideos(config);

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    return operation.response?.generatedVideos?.[0]?.video?.uri;
  } catch (error) {
    console.error("Gemini Video Error:", error);
    throw error;
  }
}

export async function searchGrounding(query: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text || "No results found.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    return { text: `Search Error: ${error.message}`, sources: [] };
  }
}
