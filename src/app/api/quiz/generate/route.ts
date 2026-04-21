import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateJSON } from '@/lib/ai/gemini';

interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  topic: string;
}

export async function GET() {
  const supabase = createServerComponentClient({ cookies });
  
  // Get today's top story clusters
  const { data: clusters } = await supabase
    .from('story_clusters')
    .select('headline, ai_summary')
    .order('created_at', { ascending: false })
    .limit(8);

  if (!clusters || clusters.length === 0) {
    return NextResponse.json({ error: 'No stories found' }, { status: 404 });
  }

  const storiesText = clusters
    .map((c, i) => `Story ${i+1}: ${c.headline}. ${c.ai_summary || ''}`)
    .join('\n\n');

  const prompt = `You are a Nigerian news quiz master for NaijaPulse.

Based on these current Nigerian news stories:
${storiesText}

Create exactly 5 multiple-choice questions that test understanding.

Return ONLY this JSON:
{
  "questions": [
    {
      "question": "Your question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this is correct (1-2 sentences that teach the reader)",
      "topic": "politics"
    }
  ]
}

Rules:
- Questions must be answerable from the stories above
- Make wrong options plausible, not obviously incorrect
- correctIndex is 0=A, 1=B, 2=C, 3=D
- Explanations should add context and teach the reader something
- Make questions progressively harder (Q1 easiest, Q5 hardest)`;

  const quizData = await generateJSON<{ questions: QuizQuestion[] }>(prompt);
  return NextResponse.json(quizData);
}
