import { getDb } from '../_lib/mongo';
import { json, methodNotAllowed } from '../_lib/response';
import { requireRole } from '../_lib/authz';
import { audit } from '../_lib/audit';

export async function GET(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient', 'admin']);
  if (auth instanceof Response) return auth;
  const db = await getDb();
  const patient = await db.collection('patients').findOne({ $or: [{ patientId: auth.userId }, { _id: auth.userId }] }, { projection: { _id: 0 } });
  if (!patient) return json({ error: 'Patient record not found.' }, { status: 404 });
  await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'patient.read', resource: `patient:${auth.userId}`, outcome: 'success' });
  return json({ patient });
}

export async function PUT(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient']);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json() as Record<string, unknown>;
    const allowed = ['name', 'email', 'village', 'organization', 'profilePhoto'];
    const update: Record<string, unknown> = {};
    for (const key of allowed) if (typeof body[key] === 'string') update[key] = String(body[key]).trim();
    update.updatedAt = new Date();
    const db = await getDb();
    const result = await db.collection('patients').updateOne({ patientId: auth.userId }, { $set: update });
    if (!result.matchedCount) return json({ error: 'Patient record not found.' }, { status: 404 });
    await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'patient.update', resource: `patient:${auth.userId}`, outcome: 'success' });
    return json({ success: true });
  } catch { return json({ error: 'Invalid patient update.' }, { status: 400 }); }
}

export function POST(): Response { return methodNotAllowed(['GET', 'PUT']); }
export function DELETE(): Response { return methodNotAllowed(['GET', 'PUT']); }