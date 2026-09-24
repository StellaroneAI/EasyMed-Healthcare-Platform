import OpenAI from 'openai';
import { requireEnv } from '../_lib/env';
import { getSession } from '../_lib/session';
import { json, methodNotAllowed } from '../_lib/response';
import { enforceRateLimit } from '../_lib/rateLimit';

export async function POST(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ error: 'Authentication required.' }, { status: 401 });
  const limit = await enforceRateLimit(`ai:${session.userId}`);
  if (!limit.allowed) return json({ error: 'Too many AI requests. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
  try {
    const form = await request.formData();
    const audio = form.get('audio');
    const language = form.get('language');
    if (!(audio instanceof File)) return json({ error: 'Audio file is required.' }, { status: 400 });
    if (audio.size > 10 * 1024 * 1024) return json({ error: 'Audio file must be 10 MB or smaller.' }, { status: 413 });
    const client = new OpenAI({ apiKey: requireEnv('OPENAI_API_KEY') });
    const result = await client.audio.transcriptions.create({
      file: audio,
      model: process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1',
      language: typeof language === 'string' ? language : undefined,
      response_format: 'text',
    });
    return json({ text: result });
  } catch (error) {
    console.error('transcribe failed', error);
    return json({ error: 'Transcription failed.' }, { status: 500 });
  }
}
export function GET(): Response { return methodNotAllowed(['POST']); }
