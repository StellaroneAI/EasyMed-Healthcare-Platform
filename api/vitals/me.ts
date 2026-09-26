import { json, methodNotAllowed } from '../_lib/response.js';
import { getDb } from '../_lib/mongo.js';
import { requireRole } from '../_lib/authz.js';
import { audit, auditPhiRead } from '../_lib/audit.js';

export async function GET(request: Request): Promise<Response> {
  const session = requireRole(request, ['patient', 'admin']);
  if (session instanceof Response) return session;
  try {
    const db = await getDb();
    const patientId = session.userType === 'patient' ? session.userId : new URL(request.url).searchParams.get('patientId');
    if (!patientId) return json({ error: 'patientId is required.' }, { status: 400 });
    const [readings, devices] = await Promise.all([
      db.collection('vital_readings').find({ patientId }).sort({ timestamp: -1 }).limit(100).toArray(),
      db.collection('monitoring_devices').find({ patientId }).sort({ updatedAt: -1 }).limit(50).toArray(),
    ]);
    await auditPhiRead({
      actorId: session.userId,
      actorRole: session.userType,
      resourceType: 'vitals',
      patientId,
      recordCount: readings.length,
    });
    return json({ readings, devices });
  } catch (error) {
    console.error('vitals GET failed', error);
    return json({ error: 'Unable to load vital data.' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  const session = requireRole(request, ['patient']);
  if (session instanceof Response) return session;
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return json({ error: 'Invalid reading.' }, { status: 400 });
    const db = await getDb();
    const now = new Date();
    if (body.vitals) {
      await db.collection('vital_readings').insertOne({
        patientId: session.userId,
        timestamp: now,
        vitals: body.vitals,
        deviceUsed: typeof body.deviceId === 'string' ? body.deviceId : 'manual',
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 1000) : undefined,
      });
    }
    if (typeof body.deviceId === 'string') {
      await db.collection('monitoring_devices').updateOne(
        { patientId: session.userId, id: body.deviceId },
        { $set: { lastSync: now, updatedAt: now } },
      );
    }
    const readings = await db.collection('vital_readings').find({ patientId: session.userId }).sort({ timestamp: -1 }).limit(100).toArray();
    const devices = await db.collection('monitoring_devices').find({ patientId: session.userId }).sort({ updatedAt: -1 }).limit(50).toArray();
    await audit({ actorId: session.userId, actorRole: session.userType, action: 'vitals.write', resource: session.userId, outcome: 'success' });
    return json({ success: true, readings, devices });
  } catch (error) {
    console.error('vitals POST failed', error);
    return json({ error: 'Unable to save vital data.' }, { status: 500 });
  }
}

export function PUT(): Response { return methodNotAllowed(['GET', 'POST']); }
export function DELETE(): Response { return methodNotAllowed(['GET', 'POST']); }
