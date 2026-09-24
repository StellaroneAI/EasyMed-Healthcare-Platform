import { createHmac, timingSafeEqual } from 'node:crypto';
import { requireEnv } from './env';

const COOKIE_NAME = 'easymed_session';
const MAX_AGE = 60 * 60 * 8;

export type Session = {
  userId: string;
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  name: string;
  phone?: string;
  email?: string;
  role?: string;
  exp: number;
};

function secret(): string {
  return requireEnv('SESSION_SECRET');
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSession(session: Omit<Session, 'exp'>): string {
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session;
    return session.exp > Math.floor(Date.now() / 1000) ? session : null;
  } catch {
    return null;
  }
}

export function getSession(request: Request): Session | null {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE_NAME}=`));
  return verifySession(match?.slice(COOKIE_NAME.length + 1));
}

export function sessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
