import { generateText } from './gemini';

export async function generateStorySummary(
  headline: string,
  articles: { title: string; content?: string; sourceName: string }[]
): Promise<string> {

  const articleText = articles
    .slice(0, 8)
    .map(a => `- ${a.sourceName}: "${a.title}" | ${(a.content || '').substring(0, 500)}`)
    .join('\n');

  const prompt = `You are a neutral Nigerian news analyst.

Write a factual, unbiased 3-4 sentence summary of this news story. Multiple Nigerian outlets covered it.

Story: ${headline}

Coverage from different outlets:
${articleText}

Rules:
1. Do NOT take political sides
2. Do NOT mention specific outlet names
3. Write in plain English all Nigerians can understand
4. Prioritize concrete details: who, what, when, where, impact
5. If facts conflict, explicitly say reports differ
6. Do not add assumptions or speculation

Write the summary:`;

  return await generateText(prompt);
}

export async function generateDailyBriefingIntro(
  date: string, 
  topHeadlines: string[]
): Promise<string> {
  const prompt = `Write ONE engaging sentence (max 25 words) introducing today's NaijaPulse Daily Briefing.
Date: ${date}
Today's top stories: ${topHeadlines.slice(0,3).join(' | ')}
Style: Journalistic, neutral, Nigeria-focused. Start with the most important story.`;
  return await generateText(prompt);
}

export async function translateToPidgin(englishText: string): Promise<string> {
  const prompt = `Translate this English news summary into Nigerian Pidgin English. Keep it natural and conversational.
English: ${englishText}
Pidgin translation (2-3 sentences max):`;
  return await generateText(prompt);
}
