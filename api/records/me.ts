import { getDb } from '../_lib/mongo';
import { json, methodNotAllowed } from '../_lib/response';
import { requireRole } from '../_lib/authz';
import { audit } from '../_lib/audit';

const clean = (v: unknown, max = 1000) => typeof v === 'string' ? v.trim().slice(0, max) : '';

export async function GET(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient', 'doctor', 'asha', 'admin']);
  if (auth instanceof Response) return auth;
  const db = await getDb();
  const filter = auth.userType === 'patient' ? { patientId: auth.userId } : auth.userType === 'admin' ? {} : { $or: [{ patientId: auth.userId }, { doctorId: auth.userId }] };
  const records = await db.collection('medical_records').find(filter).sort({ createdAt: -1 }).limit(100).toArray();
  await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'medical_records.read', resource: 'medical_records', outcome: 'success' });
  return json({ records });
}

export async function POST(request: Request): Promise<Response> {
  const auth = requireRole(request, ['doctor', 'admin']);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    const patientId = clean(body?.patientId, 100);
    const recordType = clean(body?.recordType, 80);
    const title = clean(body?.title, 200);
    const content = clean(body?.content, 5000);
    if (!patientId || !recordType || !title || !content) return json({ error: 'patientId, recordType, title and content are required.' }, { status: 400 });
    const record = { id: crypto.randomUUID(), patientId, ...(auth.userType === 'doctor' ? { doctorId: auth.userId } : (clean(body?.doctorId, 100) ? { doctorId: clean(body.doctorId, 100) } : {})), recordType, title, content, diagnosis: clean(body?.diagnosis, 1000), createdBy: auth.userId, createdAt: new Date(), updatedAt: new Date() };
    const db = await getDb();
    await db.collection('medical_records').insertOne(record);
    await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'medical_records.create', resource: record.id, outcome: 'success' });
    return json({ success: true, record }, { status: 201 });
  } catch { return json({ error: 'Unable to create medical record.' }, { status: 500 }); }
}

export async function PATCH(request: Request): Promise<Response> {
  const auth = requireRole(request, ['doctor', 'admin']);
  if (auth instanceof Response) return auth;
  try {
    const { id, title, content, diagnosis } = await request.json();
    if (typeof id !== 'string') return json({ error: 'Record id is required.' }, { status: 400 });
    const db = await getDb();
    const existing = await db.collection('medical_records').findOne({ id });
    if (!existing) return json({ error: 'Medical record not found.' }, { status: 404 });
    if (auth.userType === 'doctor' && existing.doctorId !== auth.userId) return json({ error: 'Forbidden.' }, { status: 403 });
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof title === 'string') updates.title = title.trim().slice(0, 200);
    if (typeof content === 'string') updates.content = content.trim().slice(0, 5000);
    if (typeof diagnosis === 'string') updates.diagnosis = diagnosis.trim().slice(0, 1000);
    if (Object.keys(updates).length === 1) return json({ error: 'No valid changes.' }, { status: 400 });
    await db.collection('medical_records').updateOne({ id }, { $set: updates });
    await audit({ actorId: auth.userId, actorRole: auth.userType, action: 'medical_records.update', resource: id, outcome: 'success' });
    return json({ success: true, record: await db.collection('medical_records').findOne({ id }) });
  } catch { return json({ error: 'Unable to update medical record.' }, { status: 500 }); }
}
export function PUT(): Response { return methodNotAllowed(['GET', 'POST', 'PATCH']); }
export function DELETE(): Response { return methodNotAllowed(['GET', 'POST', 'PATCH']); }
