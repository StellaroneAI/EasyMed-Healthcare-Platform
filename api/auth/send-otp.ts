import { json, methodNotAllowed } from '../_lib/response.js';
import { sendVerification } from '../_lib/twilio.js';
import { audit } from '../_lib/audit.js';
import { enforceRateLimit } from '../_lib/rateLimit.js';

export async function POST(request: Request): Promise<Response> {
  try {
    const { phone } = await request.json();
    if (typeof phone !== 'string' || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return json({ error: 'Phone number must be in E.164 format.' }, { status: 400 });
    }
    const limit = await enforceRateLimit(`otp:send:${phone}`);
    if (!limit.allowed) return json({ error: 'Too many OTP requests. Try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } });
    await sendVerification(phone);
    await audit({ actorId: phone, actorRole: 'unknown', action: 'auth.otp.send', resource: 'authentication', outcome: 'success' });
    return json({ success: true, requiresOTP: true });
  } catch (error) {
    console.error('send-otp failed', error);
    return json({ error: 'Unable to send OTP.' }, { status: 500 });
  }
}

export function GET(): Response {
  return methodNotAllowed(['POST']);
}
