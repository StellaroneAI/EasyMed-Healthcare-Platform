import { json, methodNotAllowed } from '../_lib/response';
import { sendVerification } from '../_lib/twilio';

export async function POST(request: Request): Promise<Response> {
  try {
    const { phone } = await request.json();
    if (typeof phone !== 'string' || !/^\+[1-9]\d{7,14}$/.test(phone)) {
      return json({ error: 'Phone number must be in E.164 format.' }, { status: 400 });
    }
    await sendVerification(phone);
    return json({ success: true, requiresOTP: true });
  } catch (error) {
    console.error('send-otp failed', error);
    return json({ error: 'Unable to send OTP.' }, { status: 500 });
  }
}

export function GET(): Response {
  return methodNotAllowed(['POST']);
}
