import { getSession } from '../_lib/session.js';
import { json, methodNotAllowed } from '../_lib/response.js';

export async function GET(request: Request): Promise<Response> {
  const session = getSession(request);
  if (!session) return json({ authenticated: false }, { status: 401 });
  return json({ authenticated: true, user: session });
}

export function POST(): Response {
  return methodNotAllowed(['GET']);
}
