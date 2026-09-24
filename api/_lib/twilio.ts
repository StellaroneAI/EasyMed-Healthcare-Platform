import twilio from 'twilio';
import { requireEnv } from './env';

export async function sendVerification(phone: string): Promise<void> {
  const client = twilio(requireEnv('TWILIO_ACCOUNT_SID'), requireEnv('TWILIO_AUTH_TOKEN'));
  await client.verify.v2.services(requireEnv('TWILIO_VERIFY_SERVICE_SID'))
    .verifications.create({ to: phone, channel: 'sms' });
}

export async function checkVerification(phone: string, code: string): Promise<boolean> {
  const client = twilio(requireEnv('TWILIO_ACCOUNT_SID'), requireEnv('TWILIO_AUTH_TOKEN'));
  const result = await client.verify.v2.services(requireEnv('TWILIO_VERIFY_SERVICE_SID'))
    .verificationChecks.create({ to: phone, code });
  return result.status === 'approved';
}
