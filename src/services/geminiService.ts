import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getHint(roomTitle: string, taskQuestion: string, userProgress: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a cybersecurity mentor for a platform like TryHackMe. 
    The user is working on a room called "${roomTitle}".
    The current task is: "${taskQuestion}".
    The user is stuck. Provide a subtle, helpful hint without giving away the flag or the direct answer.
    Focus on the methodology (e.g., "Have you checked for hidden directories using gobuster?" or "Look closely at the HTTP headers").
    Keep it concise and encouraging.`,
  });
  return response.text;
}

export async function generateLabDescription(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a compelling, educational description for a new cybersecurity lab room about "${topic}". 
    Include:
    1. A brief background story.
    2. What the user will learn.
    3. Prerequisites.
    Format it in Markdown.`,
  });
  return response.text;
}
