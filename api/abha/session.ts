import { getDb } from '../_lib/mongo';
import { json, methodNotAllowed } from '../_lib/response';
import { getSession } from '../_lib/session';
import { encryptABHAToken } from '../_lib/abhaVault';

export async function GET(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ error: 'Authentication required.' }, { status: 401 });
  const record = await (await getDb()).collection('abha_sessions').findOne({ userId: session.userId });
  if (!record) return json({ connected: false });
  return json({ connected: true, profile: record.profile || null });
}

export async function POST(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ error: 'Authentication required.' }, { status: 401 });
  try {
    const body = await request.json() as { accessToken?: string; refreshToken?: string; profile?: unknown };
    if (!body.accessToken && !body.profile) return json({ error: 'profile or accessToken is required.' }, { status: 400 });
    const setFields: Record<string, unknown> = { userId: session.userId, updatedAt: new Date() };
    if (body.accessToken) setFields.accessToken = encryptABHAToken(body.accessToken);
    if (body.refreshToken) setFields.refreshToken = encryptABHAToken(body.refreshToken);
    if (body.profile) setFields.profile = body.profile;
    await (await getDb()).collection('abha_sessions').updateOne(
      { userId: session.userId },
      { $set: setFields },
      { upsert: true },
    );
    return json({ connected: true });
  } catch (error) {
    console.error('ABHA session save failed', error);
    return json({ error: 'Unable to save ABHA session.' }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ error: 'Authentication required.' }, { status: 401 });
  await (await getDb()).collection('abha_sessions').deleteOne({ userId: session.userId });
  return json({ connected: false });
}

export function PUT(): Promise<Response> { return Promise.resolve(methodNotAllowed(['GET', 'POST', 'DELETE'])); }