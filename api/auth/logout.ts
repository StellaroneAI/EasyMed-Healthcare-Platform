import { clearSessionCookie } from '../_lib/session';
import { json, methodNotAllowed } from '../_lib/response';

export async function POST(): Promise<Response> {
  return json({ success: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}

export function GET(): Response {
  return methodNotAllowed(['POST']);
}
