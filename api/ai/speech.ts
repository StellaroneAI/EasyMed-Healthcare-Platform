import OpenAI from 'openai';
import { requireEnv } from '../_lib/env';
import { getSession } from '../_lib/session';
import { json, methodNotAllowed } from '../_lib/response';

const voices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;

export async function POST(request: Request): Promise<Response> {
  if (!getSession(request)) return json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const { text, voice = 'nova' } = await request.json();
    if (typeof text !== 'string' || !text.trim()) return json({ error: 'Text is required.' }, { status: 400 });
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
