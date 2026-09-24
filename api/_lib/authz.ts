import { getSession } from './session';
import { json } from './response';
import type { Session } from './session';

export function requireSession(request: Request): Session | Response {
  const session = getSession(request);
  return session || json({ error: 'Authentication required.' }, { status: 401 });
}

export function requireRole(request: Request, roles: Session['userType'][]): Session | Response {
  const result = requireSession(request);
  if (result instanceof Response) return result;
  return roles.includes(result.userType) ? result : json({ error: 'Forbidden.' }, { status: 403 });
}