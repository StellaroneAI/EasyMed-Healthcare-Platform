import { getDb } from '../_lib/mongo';
import { json, methodNotAllowed } from '../_lib/response';
import { requireRole } from '../_lib/authz';
import { audit } from '../_lib/audit';

const MAX_DAYS_AHEAD = 180;
const clean = (v: unknown, max = 200) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const dateValue = (v: unknown) => typeof v === 'string' && !Number.isNaN(new Date(v).getTime()) ? new Date(v) : null;

export async function GET(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient', 'doctor', 'asha', 'admin']);
  if (auth instanceof Response) return auth;
  const db = await getDb();
  const filter = auth.userType === 'patient' ? { patientId: auth.userId } : auth.userType === 'admin' ? {} : { $or: [{ patientId: auth.userId }, { doctorId: auth.userId }, { ashaId: auth.userId }] };
  const appointments = await db.collection('appointments').find(filter).sort({ scheduledTime: 1 }).limit(100).toArray();
  await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'appointments.read', resource: 'appointments', outcome: 'success' });
  return json({ appointments });
}

export async function POST(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient', 'doctor', 'asha', 'admin']);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const patientId = clean(body?.patientId, 100) || (auth.userType === 'patient' ? auth.userId : '');
    const doctorId = clean(body?.doctorId, 100) || (auth.userType === 'doctor' ? auth.userId : '');
    const ashaId = clean(body?.ashaId, 100) || (auth.userType === 'asha' ? auth.userId : '');
    const scheduledTime = dateValue(body?.scheduledTime);
    if (!patientId || !doctorId || !scheduledTime || scheduledTime.getTime() < Date.now() || scheduledTime.getTime() > Date.now() + MAX_DAYS_AHEAD * 86400000) return json({ error: 'patientId, doctorId and a valid time within 180 days are required.' }, { status: 400 });
    if (auth.userType === 'patient' && patientId !== auth.userId) return json({ error: 'Patients can only create their own appointments.' }, { status: 403 });
    if (auth.userType === 'doctor' && doctorId !== auth.userId) return json({ error: 'Doctors can only create appointments assigned to themselves.' }, { status: 403 });
    if (auth.userType === 'asha' && ashaId !== auth.userId) return json({ error: 'ASHA workers can only create appointments assigned to themselves.' }, { status: 403 });

    const appointment = { id: crypto.randomUUID(), patientId, doctorId, ...(ashaId ? { ashaId } : {}), scheduledTime, type: clean(body?.type, 60) || 'consultation', status: 'scheduled', reason: clean(body?.reason, 500), notes: auth.userType === 'patient' ? '' : clean(body?.notes, 1000), createdBy: auth.userId, createdAt: new Date(), updatedAt: new Date() };
    const db = await getDb();
    await db.collection('appointments').insertOne(appointment);
    await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'appointments.create', resource: appointment.id, outcome: 'success' });
    return json({ success: true, appointment }, { status: 201 });
  } catch { return json({ error: 'Unable to create appointment.' }, { status: 500 }); }
}

export async function PATCH(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient', 'doctor', 'asha', 'admin']);
  if (auth instanceof Response) return auth;
  try {
    const { id, status, notes, scheduledTime } = await request.json();
    if (typeof id !== 'string') return json({ error: 'Appointment id is required.' }, { status: 400 });
    const db = await getDb();
    const existing = await db.collection('appointments').findOne({ id });
    if (!existing) return json({ error: 'Appointment not found.' }, { status: 404 });
    if (auth.userType !== 'admin' && ![existing.patientId, existing.doctorId, existing.ashaId].includes(auth.userId)) return json({ error: 'Forbidden.' }, { status: 403 });
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof status === 'string' && ['scheduled','confirmed','completed','cancelled','no_show'].includes(status)) updates.status = status;
    if (auth.userType !== 'patient' && typeof notes === 'string') updates.notes = notes.trim().slice(0, 1000);
    if (scheduledTime !== undefined) {
      const next = dateValue(scheduledTime);
      if (!next || next.getTime() < Date.now() || next.getTime() > Date.now() + MAX_DAYS_AHEAD * 86400000) return json({ error: 'Invalid scheduled time.' }, { status: 400 });
      updates.scheduledTime = next;
    }
    if (Object.keys(updates).length === 1) return json({ error: 'No valid changes.' }, { status: 400 });
    await db.collection('appointments').updateOne({ id }, { $set: updates });
    await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'appointments.update', resource: id, outcome: 'success' });
    return json({ success: true, appointment: await db.collection('appointments').findOne({ id }) });
  } catch { return json({ error: 'Unable to update appointment.' }, { status: 500 }); }
}
export function PUT(): Response { return methodNotAllowed(['GET', 'POST', 'PATCH']); }
export function DELETE(): Response { return methodNotAllowed(['GET', 'POST', 'PATCH']); }
