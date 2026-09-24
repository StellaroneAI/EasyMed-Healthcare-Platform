import { getDb } from '../_lib/mongo';
import { json, methodNotAllowed } from '../_lib/response';
import { requireRole } from '../_lib/authz';
import { audit } from '../_lib/audit';

const relationships = ['SPOUSE','CHILD','PARENT','SIBLING','OTHER'] as const;
const genders = ['M','F','O'] as const;

export async function GET(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient','admin']);
  if (auth instanceof Response) return auth;
  const db = await getDb();
  const family = await db.collection('family_members').find({ ownerUserId: auth.userType === 'patient' ? auth.userId : (new URL(request.url).searchParams.get('patientId') || '') }).sort({ createdAt: 1 }).toArray();
  return json({ family: family.map(({ _id, ...member }) => member) });
}

export async function POST(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient']);
  if (auth instanceof Response) return auth;
  try {
    const body = await request.json();
    if (!body || typeof body.name !== 'string' || typeof body.dateOfBirth !== 'string' || !relationships.includes(body.relationshipType) || !genders.includes(body.gender)) return json({ error: 'Invalid family member.' }, { status: 400 });
    const dob = new Date(body.dateOfBirth);
    if (Number.isNaN(dob.getTime()) || dob > new Date()) return json({ error: 'Invalid date of birth.' }, { status: 400 });
    const member = { id: crypto.randomUUID(), ownerUserId: auth.userId, relationshipType: body.relationshipType, healthId: typeof body.healthId === 'string' ? body.healthId.trim().slice(0, 100) : '', name: body.name.trim().slice(0, 120), dateOfBirth: body.dateOfBirth, gender: body.gender, mobile: typeof body.mobile === 'string' ? body.mobile.trim().slice(0, 20) : '', isLinked: false, consentGiven: false, createdAt: new Date(), updatedAt: new Date() };
    const db = await getDb();
    await db.collection('family_members').insertOne(member);
    await audit({ actorId: auth.userId, actorRole: 'patient', action: 'family.create', resource: member.id, outcome: 'success' });
    return json({ success: true, member }, { status: 201 });
  } catch { return json({ error: 'Unable to create family member.' }, { status: 500 }); }
}

export async function PATCH(request: Request): Promise<Response> {
  const auth = requireRole(request, ['patient']);
  if (auth instanceof Response) return auth;
  try {
    const { id, healthId, isLinked, consentGiven } = await request.json();
    if (typeof id !== 'string') return json({ error: 'Family member id is required.' }, { status: 400 });
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof healthId === 'string') updates.healthId = healthId.trim().slice(0, 100);
    if (typeof isLinked === 'boolean') updates.isLinked = isLinked;
    if (typeof consentGiven === 'boolean') updates.consentGiven = consentGiven;
    const db = await getDb();
    const result = await db.collection('family_members').updateOne({ id, ownerUserId: auth.userId }, { $set: updates });
    if (!result.matchedCount) return json({ error: 'Family member not found.' }, { status: 404 });
    await audit({ actorId: auth.userId, actorRole: 'patient', action: 'family.update', resource: id, outcome: 'success' });
    return json({ success: true });
  } catch { return json({ error: 'Unable to update family member.' }, { status: 500 }); }
}

export function PUT(): Response { return methodNotAllowed(['GET','POST','PATCH']); }
export function DELETE(): Response { return methodNotAllowed(['GET','POST','PATCH']); }
