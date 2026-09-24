import OpenAI from 'openai';
import { requireEnv } from '../_lib/env';
import { getSession } from '../_lib/session';
import { json, methodNotAllowed } from '../_lib/response';

export async function POST(request: Request): Promise<Response> {
  if (!getSession(request)) return json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const { query, language = 'english', context = {} } = await request.json();
    if (typeof query !== 'string' || !query.trim()) return json({ error: 'Query is required.' }, { status: 400 });
    const client = new OpenAI({ apiKey: requireEnv('OPENAI_API_KEY') });
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are EasyMedPro's AI health assistant. Respond in ${language}. Give concise, medically cautious information. Do not diagnose with certainty. Encourage professional care for urgent or serious symptoms. Context: ${JSON.stringify(context)}` },
        { role: 'user', content: query },
      ],
      temperature: 0.2,
      max_tokens: 500,
    });
    return json({ answer: completion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('health-query failed', error);
    return json({ error: 'AI request failed.' }, { status: 500 });
  }
}

export function GET(): Response {
  return methodNotAllowed(['POST']);
}
