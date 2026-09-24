import { getDb } from '../_lib/mongo';
import { json, methodNotAllowed } from '../_lib/response';
import { requireRole } from '../_lib/authz';
import { audit } from '../_lib/audit';

export async function GET(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient', 'doctor', 'asha', 'admin']);
  if (auth instanceof Response) return auth;
  const db = await getDb();
  const filter = auth.userType === 'patient' ? { patientId: auth.userId } : { $or: [{ patientId: auth.userId }, { doctorId: auth.userId }] };
  const items = await db.collection('medical_records').find(filter).sort({ createdAt: -1 }).limit(100).toArray();
  await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'medical_records.read', resource: 'medical_records', outcome: 'success' });
  return json({ records: items });
}
export function POST(): Response { return methodNotAllowed(['GET']); }
export function PUT(): Response { return methodNotAllowed(['GET']); }
export function DELETE(): Response { return methodNotAllowed(['GET']); }