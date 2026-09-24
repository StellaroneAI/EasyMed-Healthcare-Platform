import { requireEnv } from '../_lib/env';
import { getSession } from '../_lib/session';
import { json } from '../_lib/response';
import { getDb } from '../_lib/mongo';
import { decryptABHAToken } from '../_lib/abhaVault';

const ALLOWED_PREFIX = '/v2/';

export async function GET(request: Request): Promise<Response> {
  return proxy(request);
}
export async function POST(request: Request): Promise<Response> {
  return proxy(request);
}
export async function PUT(request: Request): Promise<Response> {
  return proxy(request);
}
export async function DELETE(request: Request): Promise<Response> {
  return proxy(request);
}

async function proxy(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ error: 'Authentication required.' }, { status: 401 });

  const incoming = new URL(request.url);
  const path = incoming.searchParams.get('path') || '';
  if (!path.startsWith(ALLOWED_PREFIX) || path.includes('..')) {
    return json({ error: 'Invalid ABHA path.' }, { status: 400 });
  }

  const target = new URL(path, requireEnv('ABDM_BASE_URL')).toString();
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const record = await (await getDb()).collection('abha_sessions').findOne({ userId: session.userId });
  const authorization = record?.accessToken ? `Bearer ${decryptABHAToken(record.accessToken)}` : null;
  if (contentType) headers.set('content-type', contentType);
  if (authorization) headers.set('authorization', authorization);
  headers.set('X-CM-ID', requireEnv('ABDM_CLIENT_ID'));

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'DELETE' ? undefined : await request.arrayBuffer(),
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('ABHA proxy failed', error);
    return json({ error: 'ABHA service unavailable.' }, { status: 502 });
  }
}
