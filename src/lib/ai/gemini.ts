import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  // gemini-2.0-flash-exp is the free, fast model
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.3, // Lower = more factual, less creative
    maxOutputTokens: 1024,
  },
});

export async function generateText(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text().trim();
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const jsonPrompt = `${prompt}

IMPORTANT: Respond with ONLY valid JSON. No markdown. No backticks. No explanation.`;

  const text = await generateText(jsonPrompt);

  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  return JSON.parse(cleaned) as T;
}

export default geminiModel;

