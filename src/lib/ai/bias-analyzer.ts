import { generateJSON } from './gemini';

interface BiasResult {
  politicalBias: 'Pro-Federal-Government' | 'Independent' | 'Opposition-Leaning' | 'International';
  biasScore: number;
  confidence: number;
  sensationalismScore: number;
  topics: string[];
}

export async function analyzeArticleBias(article: {
  title: string;
  content?: string;
  sourceName: string;
}): Promise<BiasResult> {

  const prompt = `You are a Nigerian media bias analyst. Analyze this article.

Source outlet: "${article.sourceName}"
Headline: ${article.title}
Content snippet: ${(article.content || '').substring(0, 600)}

Return ONLY this JSON — no other text:
{
  "politicalBias": "Pro-Federal-Government" OR "Independent" OR "Opposition-Leaning" OR "International",
  "biasScore": (number 1-10: 1=strongly pro-government, 5=neutral, 10=strongly opposition),
  "confidence": (number 0.0-1.0, how confident you are),
  "sensationalismScore": (number 1-10, how sensational/clickbait the headline is),
  "topics": (array of 1-3 strings from: politics, economy, security, sports, entertainment, education, health, technology, religion, international)
}`;

  try {
    return await generateJSON<BiasResult>(prompt);
  } catch {
    return { 
      politicalBias: 'Independent', 
      biasScore: 5, 
      confidence: 0.3, 
      sensationalismScore: 5, 
      topics: ['politics'] 
    };
  }
}
