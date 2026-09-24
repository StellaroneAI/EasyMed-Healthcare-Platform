import OpenAI from 'openai';
import { requireEnv } from '../_lib/env.js';
import { getSession } from '../_lib/session.js';
import { json, methodNotAllowed } from '../_lib/response.js';
import { enforceRateLimit } from '../_lib/rateLimit.js';

const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;

export async function POST(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ error: 'Authentication required.' }, { status: 401 });
  const limit = await enforceRateLimit(`ai:${session.userId}`);
  if (!limit.allowed) return json({ error: 'Too many AI requests. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  try {
    const { text, voice = 'nova' } = await request.json();
    if (typeof text !== 'string' || !text.trim() || text.length > 4000) return json({ error: 'Text is required and must be 4,000 characters or fewer.' }, { status: 400 });
    const selectedVoice = voices.includes(voice) ? voice : 'nova';
    const client = new OpenAI({ apiKey: requireEnv('OPENAI_API_KEY') });
    const response = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'tts-1-hd',
      voice: selectedVoice,
      input: text,
      response_format: 'mp3',
      speed: 0.9,
    });
    return new Response(await response.arrayBuffer(), { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('speech failed', error);
    return json({ error: 'Speech generation failed.' }, { status: 500 });
  }
}
export function GET(): Response { return methodNotAllowed(['POST']); }
