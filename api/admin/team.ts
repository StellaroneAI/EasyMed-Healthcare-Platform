import { json, methodNotAllowed } from '../_lib/response';
import { getDb } from '../_lib/mongo';
import { requireRole } from '../_lib/authz';
import { audit } from '../_lib/audit';

const roles = ['super_admin', 'admin', 'manager', 'coordinator'] as const;

export async function GET(request: Request): Promise<Response> {
  const session = requireRole(request, ['admin']);
  if (session instanceof Response) return session;
  try {
    const db = await getDb();
    const team = await db.collection('admin_team').find({ isActive: { $ne: false } }).sort({ createdAt: 1 }).toArray();
    return json({ team });
  } catch { return json({ error: 'Unable to load team.' }, { status: 500 }); }
}

export async function POST(request: Request): Promise<Response> {
  const session = requireRole(request, ['admin']);
  if (session instanceof Response) return session;
  try {
    const body = await request.json();
    if (!body || typeof body.name !== 'string' || typeof body.phone !== 'string' || !roles.includes(body.role)) {
      return json({ error: 'Invalid team member.' }, { status: 400 });
    }
    const db = await getDb();
    const member = {
      name: body.name.trim().slice(0, 120),
      phone: body.phone,
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined,
      designation: typeof body.designation === 'string' ? body.designation.slice(0, 120) : 'Administrator',
      role: body.role,
      permissions: Array.isArray(body.permissions) ? body.permissions.slice(0, 50) : [],
      isActive: body.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('admin_team').insertOne(member);
    await audit({ actorId: session.userId, actorRole: 'admin', action: 'admin.team.create', resource: String(member.phone), outcome: 'success' });
    const team = await db.collection('admin_team').find({ isActive: { $ne: false } }).sort({ createdAt: 1 }).toArray();
    return json({ success: true, team }, { status: 201 });
  } catch { return json({ error: 'Unable to create team member.' }, { status: 500 }); }
}

export async function PATCH(request: Request): Promise<Response> {
  const session = requireRole(request, ['admin']);
  if (session instanceof Response) return session;
  try {
    const { id, updates } = await request.json();
    if (typeof id !== 'string' || !updates || typeof updates !== 'object') return json({ error: 'Invalid update.' }, { status: 400 });
    const allowed = ['name', 'phone', 'email', 'designation', 'role', 'permissions', 'isActive'];
    const $set: Record<string, unknown> = { updatedAt: new Date() };
    for (const key of allowed) if (key in updates) $set[key] = updates[key];
    const db = await getDb();
    await db.collection('admin_team').updateOne({ _id: id }, { $set });
    const team = await db.collection('admin_team').find({ isActive: { $ne: false } }).sort({ createdAt: 1 }).toArray();
    await audit({ actorId: session.userId, actorRole: 'admin', action: 'admin.team.update', resource: id, outcome: 'success' });
    return json({ success: true, team });
  } catch { return json({ error: 'Unable to update team member.' }, { status: 500 }); }
}

export async function DELETE(request: Request): Promise<Response> {
  const session = requireRole(request, ['admin']);
  if (session instanceof Response) return session;
  try {
    const { id } = await request.json();
    if (typeof id !== 'string') return json({ error: 'Invalid team member.' }, { status: 400 });
    const db = await getDb();
    await db.collection('admin_team').updateOne({ _id: id }, { $set: { isActive: false, updatedAt: new Date() } });
    const team = await db.collection('admin_team').find({ isActive: { $ne: false } }).sort({ createdAt: 1 }).toArray();
    await audit({ actorId: session.userId, actorRole: 'admin', action: 'admin.team.delete', resource: id, outcome: 'success' });
    return json({ success: true, team });
  } catch { return json({ error: 'Unable to remove team member.' }, { status: 500 }); }
}

export function PUT(): Response { return methodNotAllowed(['GET', 'POST', 'PATCH', 'DELETE']); }
