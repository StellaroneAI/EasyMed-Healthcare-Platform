import { getSession } from './session.js';
import { json } from './response.js';
import type { Session } from './session.js';

export function requireSession(request: Request): Session | Response {
  const session = getSession(request);
  return session || json({ error: 'Authentication required.' }, { status: 401 });
}

export function requireRole(request: Request, roles: Session['userType'][]): Session | Response {
  const result = requireSession(request);
  if (result instanceof Response) return result;
  return roles.includes(result.userType) ? result : json({ error: 'Forbidden.' }, { status: 403 });
}