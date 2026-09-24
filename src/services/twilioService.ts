export interface OTPVerificationResult {
  status: 'pending' | 'approved' | 'cancelled' | 'failed';
  valid: boolean;
  sid?: string;
  errorMessage?: string;
}

export interface OTPSendResult {
  status: 'pending' | 'failed';
  sid?: string;
  errorMessage?: string;
}

class TwilioService {
  formatPhoneNumber(phoneNumber: string): string | null {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned)) return '+91' + cleaned;
    if (cleaned.length === 12 && cleaned.startsWith('91')) return '+' + cleaned;
    if (cleaned.length === 13 && cleaned.startsWith('091')) return '+' + cleaned.slice(1);
    if (/^\+[1-9]\d{7,14}$/.test(phoneNumber.trim())) return phoneNumber.trim();
    return null;
  }

  async sendOTP(phoneNumber: string): Promise<OTPSendResult> {
    const formatted = this.formatPhoneNumber(phoneNumber);
    if (!formatted) return { status: 'failed', errorMessage: 'Invalid phone number format' };
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: formatted }),
      });
      const data = await response.json();
      return response.ok ? { status: 'pending' } : { status: 'failed', errorMessage: data.error || 'Failed to send OTP' };
    } catch {
      return { status: 'failed', errorMessage: 'Unable to reach authentication service' };
    }
  }

  async verifyOTP(phoneNumber: string, code: string): Promise<OTPVerificationResult> {
    const formatted = this.formatPhoneNumber(phoneNumber);
    if (!formatted) return { status: 'failed', valid: false, errorMessage: 'Invalid phone number format' };
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: formatted, otp: code }),
      });
      const data = await response.json();
      return response.ok
        ? { status: 'approved', valid: true }
        : { status: 'failed', valid: false, errorMessage: data.error || 'Invalid OTP' };
    } catch {
      return { status: 'failed', valid: false, errorMessage: 'Unable to reach authentication service' };
    }
  }

  isConfigured(): boolean {
    return true;
  }

  getStatus() {
    return { configured: true, demoMode: false, provider: 'Twilio Verify via secure backend' };
  }
}

export const twilioService = new TwilioService();
export default twilioService;
