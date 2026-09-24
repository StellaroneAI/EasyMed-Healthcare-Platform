import { clearSessionCookie } from '../_lib/session.js';
import { json, methodNotAllowed } from '../_lib/response.js';
import { audit } from '../_lib/audit.js';

export async function POST(request: Request): Promise<Response> {
  return json({ success: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}

export function GET(): Response {
  return methodNotAllowed(['POST']);
}
