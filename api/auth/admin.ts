import { scryptSync, timingSafeEqual } from 'node:crypto';
import { requireEnv } from '../_lib/env';
import { createSession, sessionCookie } from '../_lib/session';
import { json, methodNotAllowed } from '../_lib/response';
import { audit } from '../_lib/audit';
import { enforceRateLimit } from '../_lib/rateLimit';

function verifyPassword(password: string, stored: string): boolean {
  const [salt, encoded] = stored.split('$');
  if (!salt || !encoded) return false;
  const expected = Buffer.from(encoded, 'base64url');
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password } = await request.json();
    if (typeof email !== 'string' || typeof password !== 'string') {
      return json({ error: 'Email and password are required.' }, { status: 400 });
    }
    const limit = await enforceRateLimit(`admin:login:${email.trim().toLowerCase()}`);
    if (!limit.allowed) return json({ error: 'Too many login attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
    const configuredEmail = requireEnv('ADMIN_EMAIL').trim().toLowerCase();
    const passwordHash = requireEnv('ADMIN_PASSWORD_HASH');
    if (email.trim().toLowerCase() !== configuredEmail || !verifyPassword(password, passwordHash)) {
      await audit({ actorId: email, actorRole: 'admin', action: 'auth.admin.login', resource: 'authentication', outcome: 'denied' });
      return json({ error: 'Invalid administrator credentials.' }, { status: 401 });
    }
    await audit({ actorId: configuredEmail, actorRole: 'admin', action: 'auth.admin.login', resource: 'authentication', outcome: 'success' });
    const session = createSession({
      userId: 'admin',
      userType: 'admin',
      name: process.env.ADMIN_NAME || 'EasyMed Administrator',
      email: configuredEmail,
      role: 'admin',
    });
    return json({ success: true, user: { id: 'admin', name: process.env.ADMIN_NAME || 'EasyMed Administrator', email: configuredEmail, userType: 'admin', role: 'admin' } }, {
      headers: { 'Set-Cookie': sessionCookie(session) },
    });
  } catch (error) {
    console.error('admin auth failed', error);
    return json({ error: 'Authentication service failed.' }, { status: 500 });
  }
}

export function GET(): Response { return methodNotAllowed(['POST']); }
