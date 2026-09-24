import { json, methodNotAllowed } from '../_lib/response.js';
import { getDb } from '../_lib/mongo.js';
import { requireSession } from '../_lib/authz.js';
import { audit } from '../_lib/audit.js';

const roles = ['super_admin', 'admin', 'manager', 'coordinator'] as const;
type TeamRole = typeof roles[number];

function requireSuperAdmin(request: Request) {
  const session = requireSession(request);
  if (session instanceof Response) return session;
  if (session.userType !== 'admin' || session.role !== 'super_admin') {
    return json({ error: 'Super administrator access required.' }, { status: 403 });
  }
  return session;
}

function sanitize(member: Record<string, unknown>) {
  return {
    id: String(member.id ?? member._id ?? ''),
    name: member.name,
    phone: member.phone,
    email: member.email,
    designation: member.designation,
    role: member.role,
    permissions: member.permissions,
    isActive: member.isActive !== false,
    createdAt: member.createdAt,
  };
}

async function activeTeam() {
  const db = await getDb();
  const team = await db.collection('admin_team').find({ isActive: { $ne: false } }).sort({ createdAt: 1 }).toArray();
  return team.map(member => sanitize(member as Record<string, unknown>));
}

export async function GET(request: Request): Promise<Response> {
  const session = requireSession(request);
  if (session instanceof Response) return session;
  if (session.userType !== 'admin') return json({ error: 'Forbidden.' }, { status: 403 });
  try {
    return json({ team: await activeTeam() });
  } catch { return json({ error: 'Unable to load team.' }, { status: 500 }); }
}

export async function POST(request: Request): Promise<Response> {
  const session = requireSuperAdmin(request);
  if (session instanceof Response) return session;
  try {
    const body = await request.json();
    if (!body || typeof body.name !== 'string' || typeof body.phone !== 'string' || !roles.includes(body.role as TeamRole)) {
      return json({ error: 'Invalid team member.' }, { status: 400 });
    }
    const db = await getDb();
    const now = new Date();
    const member = {
      id: crypto.randomUUID(),
      name: body.name.trim().slice(0, 120),
      phone: body.phone.trim(),
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : undefined,
      designation: typeof body.designation === 'string' ? body.designation.trim().slice(0, 120) : 'Administrator',
      role: body.role as TeamRole,
      permissions: Array.isArray(body.permissions) ? body.permissions.filter((p: unknown) => typeof p === 'string').slice(0, 50) : [],
      isActive: body.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };
    await db.collection('admin_team').insertOne(member);
    await audit({ actorId: session.userId, actorRole: 'admin', action: 'admin.team.create', resource: member.id, outcome: 'success' });
    return json({ success: true, team: await activeTeam() }, { status: 201 });
  } catch { return json({ error: 'Unable to create team member.' }, { status: 500 }); }
}

export async function PATCH(request: Request): Promise<Response> {
  const session = requireSuperAdmin(request);
  if (session instanceof Response) return session;
  try {
    const { id, updates } = await request.json();
    if (typeof id !== 'string' || !updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return json({ error: 'Invalid update.' }, { status: 400 });
    }
    const allowed = ['name', 'phone', 'email', 'designation', 'role', 'permissions', 'isActive'];
    const $set: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowed) {
      if (!(key in updates)) continue;
      if (key === 'role' && !roles.includes(updates[key] as TeamRole)) return json({ error: 'Invalid role.' }, { status: 400 });
      if (key === 'permissions' && (!Array.isArray(updates[key]) || updates[key].some((p: unknown) => typeof p !== 'string'))) return json({ error: 'Invalid permissions.' }, { status: 400 });
      if (typeof updates[key] === 'string') $set[key] = updates[key].trim().slice(0, key === 'email' ? 254 : 120);
      else if (key === 'permissions') $set[key] = updates[key].slice(0, 50);
      else if (typeof updates[key] === 'boolean' && key === 'isActive') $set[key] = updates[key];
      else return json({ error: `Invalid ${key}.` }, { status: 400 });
    }
    const db = await getDb();
    const result = await db.collection('admin_team').updateOne({ id }, { $set });
    if (!result.matchedCount) return json({ error: 'Team member not found.' }, { status: 404 });
    await audit({ actorId: session.userId, actorRole: 'admin', action: 'admin.team.update', resource: id, outcome: 'success' });
    return json({ success: true, team: await activeTeam() });
  } catch { return json({ error: 'Unable to update team member.' }, { status: 500 }); }
}

export async function DELETE(request: Request): Promise<Response> {
  const session = requireSuperAdmin(request);
  if (session instanceof Response) return session;
  try {
    const { id } = await request.json();
    if (typeof id !== 'string') return json({ error: 'Invalid team member.' }, { status: 400 });
    const db = await getDb();
    const result = await db.collection('admin_team').updateOne({ id }, { $set: { isActive: false, updatedAt: new Date() } });
    if (!result.matchedCount) return json({ error: 'Team member not found.' }, { status: 404 });
    await audit({ actorId: session.userId, actorRole: 'admin', action: 'admin.team.delete', resource: id, outcome: 'success' });
    return json({ success: true, team: await activeTeam() });
  } catch { return json({ error: 'Unable to remove team member.' }, { status: 500 }); }
}

export function PUT(): Response { return methodNotAllowed(['GET', 'POST', 'PATCH', 'DELETE']); }
