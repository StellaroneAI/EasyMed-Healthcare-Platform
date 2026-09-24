import { getDb } from '../_lib/mongo.js';
import { json, methodNotAllowed } from '../_lib/response.js';
import { requireRole } from '../_lib/authz.js';
import { audit } from '../_lib/audit.js';

export async function GET(request: Request): Promise<Response> {
  const a = requireRole(request, ['patient', 'doctor', 'admin']);
  if (a instanceof Response) return a;
  try {
    const db = await getDb();
    const medicationId = new URL(request.url).searchParams.get('medicationId');
    if (!medicationId) return json({ error: 'medicationId is required.' }, { status: 400 });
    const medication = await db.collection('medications').findOne({ id: medicationId });
    if (!medication) return json({ error: 'Medication not found.' }, { status: 404 });
    if (a.userType === 'patient' && medication.patientId !== a.userId) return json({ error: 'Forbidden.' }, { status: 403 });
    if (a.userType === 'doctor' && medication.doctorId !== a.userId) return json({ error: 'Forbidden.' }, { status: 403 });
    const events = await db.collection('medication_adherence').find({ medicationId }).sort({ takenAt: -1 }).limit(200).toArray();
    return json({ events });
  } catch {
    return json({ error: 'Unable to load medication adherence.' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  const a = requireRole(request, ['patient']);
  if (a instanceof Response) return a;
  try {
    const b = await request.json();
    const medicationId = typeof b?.medicationId === 'string' ? b.medicationId.trim() : '';
    const taken = typeof b?.taken === 'boolean' ? b.taken : null;
    const takenAt = new Date(b?.takenAt || Date.now());
    if (!medicationId || taken === null || Number.isNaN(takenAt.getTime())) return json({ error: 'Invalid adherence event.' }, { status: 400 });
    const db = await getDb();
    const medication = await db.collection('medications').findOne({ id: medicationId, patientId: a.userId });
    if (!medication) return json({ error: 'Medication not found.' }, { status: 404 });
    const event = { id: crypto.randomUUID(), medicationId, patientId: a.userId, taken, takenAt, createdAt: new Date() };
    await db.collection('medication_adherence').insertOne(event);
    await audit({ actorId: a.userId, actorRole: 'patient', action: 'medication.adherence.create', resource: medicationId, outcome: 'success' });
    return json({ success: true, event }, { status: 201 });
  } catch {
    return json({ error: 'Unable to record adherence.' }, { status: 500 });
  }
}
export function PUT(): Response { return methodNotAllowed(['GET', 'POST']); }
export function PATCH(): Response { return methodNotAllowed(['GET', 'POST']); }
export function DELETE(): Response { return methodNotAllowed(['GET', 'POST']); }
