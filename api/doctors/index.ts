import { getDb } from '../_lib/mongo.js';
import { json, methodNotAllowed } from '../_lib/response.js';
import { requireRole } from '../_lib/authz.js';

export async function GET(request: Request): Promise<Response> {
  const session = requireRole(request, ['patient', 'admin']);
  if (session instanceof Response) return session;
  try {
    const db = await getDb();
    const doctors = await db.collection('doctors')
      .find({ isActive: { $ne: false } }, { projection: { _id: 0, doctorId: 1, name: 1, specialty: 1, designation: 1 } })
      .sort({ name: 1 }).limit(100).toArray();
    return json({ doctors });
  } catch {
    return json({ error: 'Unable to load doctors.' }, { status: 500 });
  }
}
export function POST(): Response { return methodNotAllowed(['GET']); }
export function PUT(): Response { return methodNotAllowed(['GET']); }
export function PATCH(): Response { return methodNotAllowed(['GET']); }
export function DELETE(): Response { return methodNotAllowed(['GET']); }
