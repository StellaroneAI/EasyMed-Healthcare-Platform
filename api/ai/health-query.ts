import OpenAI from 'openai';
import { requireEnv } from '../_lib/env.js';
import { getSession } from '../_lib/session.js';
import { json, methodNotAllowed } from '../_lib/response.js';
import { enforceRateLimit } from '../_lib/rateLimit.js';

export async function POST(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ error: 'Authentication required.' }, { status: 401 });
  const limit = await enforceRateLimit(`ai:${session.userId}`);
  if (!limit.allowed) return json({ error: 'Too many AI requests. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  try {
    const { query, language = 'english', context = {} } = await request.json();
    if (typeof query !== 'string' || !query.trim() || query.length > 4000) return json({ error: 'Query is required and must be 4,000 characters or fewer.' }, { status: 400 });
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
