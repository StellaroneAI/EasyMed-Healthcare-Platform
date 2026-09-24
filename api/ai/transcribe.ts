import OpenAI from 'openai';
import { requireEnv } from '../_lib/env';
import { getSession } from '../_lib/session';
import { json, methodNotAllowed } from '../_lib/response';

export async function POST(request: Request): Promise<Response> {
  if (!getSession(request)) return json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const form = await request.formData();
    const audio = form.get('audio');
    const language = form.get('language');
    if (!(audio instanceof File)) return json({ error: 'Audio file is required.' }, { status: 400 });
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
