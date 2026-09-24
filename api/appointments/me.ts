import { getDb } from '../_lib/mongo';
import { json, methodNotAllowed } from '../_lib/response';
import { requireRole } from '../_lib/authz';
import { audit } from '../_lib/audit';

export async function GET(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient', 'doctor', 'asha', 'admin']);
  if (auth instanceof Response) return auth;
  const db = await getDb();
  const filter = auth.userType === 'patient' ? { patientId: auth.userId } : { $or: [{ patientId: auth.userId }, { doctorId: auth.userId }, { ashaId: auth.userId }] };
  const items = await db.collection('appointments').find(filter).sort({ scheduledTime: 1 }).limit(100).toArray();
  await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'appointments.read', resource: 'appointments', outcome: 'success' });
  return json({ appointments: items });
}
export function POST(): Response { return methodNotAllowed(['GET']); }
export function PUT(): Response { return methodNotAllowed(['GET']); }
export function DELETE(): Response { return methodNotAllowed(['GET']); }