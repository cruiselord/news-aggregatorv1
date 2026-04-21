import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.3, // Lower = more factual, less creative
    maxOutputTokens: 1024,
  },
});

export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-005",
});

export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text().trim();
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429")) {
      console.warn("Gemini 429 error, falling back to Groq");
      if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set for fallback");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1024
        })
      });
      if (!res.ok) {
        throw new Error(`Groq fallback failed: ${await res.text()}`);
      }
      const data = await res.json();
      return data.choices[0].message.content.trim();
    }
    throw error;
  }
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

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const requests = texts.map(t => ({ content: { role: 'user', parts: [{ text: t }] } }));
  const result = await embeddingModel.batchEmbedContents({ requests });
  return result.embeddings.map(e => e.values);
}

export default geminiModel;
