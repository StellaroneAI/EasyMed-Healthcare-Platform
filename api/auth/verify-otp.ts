import { json, methodNotAllowed } from '../_lib/response';
import { checkVerification } from '../_lib/twilio';
import { createSession, sessionCookie } from '../_lib/session';
import { getDb } from '../_lib/mongo';
import { audit } from '../_lib/audit';
import { enforceRateLimit } from '../_lib/rateLimit';

export async function POST(request: Request): Promise<Response> {
  try {
    const { phone, otp, userType = 'patient', name } = await request.json();
    if (
      typeof phone !== 'string' ||
      typeof otp !== 'string' ||
      !/^\+[1-9]\d{7,14}$/.test(phone) ||
      !/^\d{6}$/.test(otp) ||
      !['patient', 'doctor', 'asha', 'admin'].includes(userType)
    ) {
      return json({ error: 'Invalid verification request.' }, { status: 400 });
    }
    const limit = await enforceRateLimit(`otp:verify:${phone}`);
    if (!limit.allowed) return json({ error: 'Too many verification attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
    if (!await checkVerification(phone, otp)) {
      await audit({ actorId: phone, actorRole: userType, action: 'auth.otp.verify', resource: 'authentication', outcome: 'denied' });
      return json({ error: 'Invalid or expired OTP.' }, { status: 401 });
    }

    await audit({ actorId: phone, actorRole: userType, action: 'auth.otp.verify', resource: 'authentication', outcome: 'success' });

    if (userType === 'admin') {
      const adminPhone = process.env.ADMIN_PHONE;
      if (!adminPhone || phone !== adminPhone) {
        return json({ error: 'Administrator phone authentication is not enabled for this number.' }, { status: 403 });
      }
      const session = createSession({
        userId: 'admin',
        userType: 'admin',
        name: process.env.ADMIN_NAME || 'EasyMed Administrator',
        phone,
        role: process.env.ADMIN_ROLE === 'super_admin' ? 'super_admin' : 'admin',
      });
      return json({ success: true, user: { id: 'admin', name: process.env.ADMIN_NAME || 'EasyMed Administrator', phone, userType: 'admin', role: process.env.ADMIN_ROLE === 'super_admin' ? 'super_admin' : 'admin' } }, {
        headers: { 'Set-Cookie': sessionCookie(session) },
      });
    }

    const db = await getDb();
    const collection = userType === 'doctor' ? 'doctors' : userType === 'asha' ? 'ashaworkers' : 'patients';
    const userCollection = db.collection(collection) as any;
    const phoneField = 'phone';
    let user = await userCollection.findOne({ [phoneField]: phone });
    if (!user && userType !== 'patient') {
      return json({ error: 'This healthcare role must be provisioned by an administrator.' }, { status: 403 });
    }
    if (!user) {
      const id = `${userType}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const record: Record<string, unknown> = {
        [userType === 'doctor' ? 'doctorId' : userType === 'asha' ? 'ashaId' : 'patientId']: id,
        name: typeof name === 'string' && name.trim() ? name.trim() : `User ${phone.slice(-4)}`,
        phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await userCollection.insertOne(record);
      user = record;
    }

    const userId = String(user.patientId || user.doctorId || user.ashaId || user._id);
    const session = createSession({
      userId,
      userType,
      name: String(user.name || 'EasyMed User'),
      phone,
    });
    return json({ success: true, user: { id: userId, name: user.name, phone, userType } }, {
      headers: { 'Set-Cookie': sessionCookie(session) },
    });
  } catch (error) {
    console.error('verify-otp failed', error);
    return json({ error: 'Authentication failed.' }, { status: 500 });
  }
}

export function GET(): Response {
  return methodNotAllowed(['POST']);
}
