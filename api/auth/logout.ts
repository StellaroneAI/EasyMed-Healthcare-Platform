import { clearSessionCookie } from '../_lib/session';
import { json, methodNotAllowed } from '../_lib/response';
import { audit } from '../_lib/audit';

export async function POST(request: Request): Promise<Response> {
  return json({ success: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}

export function GET(): Response {
  return methodNotAllowed(['POST']);
}
