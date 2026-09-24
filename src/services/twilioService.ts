// Twilio Service for OTP Authentication
// Browser-safe mock that avoids bundling server-only Twilio SDK

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  serviceSid: string; // Verify Service SID
}

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

type OTPEntry = {
  code: string;
  expiresAt: number;
};

class TwilioService {
  private accountSid: string;
  private authToken: string;
  private serviceSid: string;
  private otpStore: Map<string, OTPEntry> = new Map();

  constructor() {
    this.accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
    this.authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
    this.serviceSid = import.meta.env.VITE_TWILIO_VERIFY_SERVICE_SID || '';
  }

  /**
   * Send OTP to phone number
   * @param phoneNumber - Phone number in E.164 format (+91XXXXXXXXXX)
   * @returns Promise<OTPSendResult>
   */
  async sendOTP(phoneNumber: string): Promise<OTPSendResult> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      // Generate mock OTP and store with 5 minute expiry
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;
      this.otpStore.set(phoneNumber, { code: otp, expiresAt });

      console.log(`🔧 Demo Mode: OTP ${otp} generated for ${phoneNumber}. Expires in 5 minutes.`);

      return {
        status: 'pending',
        sid: 'demo_verification_' + Date.now()
      };

    } catch (error: any) {
      console.error('Twilio OTP send error:', error);
      return {
        status: 'failed',
        errorMessage: error.message || 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP code
   * @param phoneNumber - Phone number in E.164 format
   * @param code - 6-digit OTP code
   * @returns Promise<OTPVerificationResult>
   */
  async verifyOTP(phoneNumber: string, code: string): Promise<OTPVerificationResult> {
    try {
      const session = this.otpStore.get(phoneNumber);

      if (!session || Date.now() > session.expiresAt) {
        this.otpStore.delete(phoneNumber);
        return {
          status: 'failed',
          valid: false,
          errorMessage: 'OTP session expired. Please request a new OTP.'
        };
      }

      const isValid = session.code === code;
      if (!isValid) {
        return {
          status: 'failed',
          valid: false,
          errorMessage: 'Invalid OTP'
        };
      }

      // Clean up after successful verification
      this.otpStore.delete(phoneNumber);

      return {
        status: 'approved',
        valid: true,
        sid: 'demo_verification_check_' + Date.now()
      };

    } catch (error: any) {
      console.error('Twilio OTP verify error:', error);
      return {
        status: 'failed',
        valid: false,
        errorMessage: error.message || 'Failed to verify OTP'
      };
    }
  }

  /**
   * Format phone number to E.164 format
   * @param phoneNumber - Raw phone number
   * @returns Formatted phone number or null if invalid
   */
  formatPhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Indian phone numbers
    if (cleaned.length === 10 && cleaned.startsWith('6789')) {
      return '+91' + cleaned;
    }
    
    // Already formatted
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return '+' + cleaned;
    }
    
    // Already with country code
    if (cleaned.length === 13 && cleaned.startsWith('091')) {
      return '+' + cleaned.substring(1);
    }
    
    return null;
  }

  /**
   * Validate phone number format
   * @param phoneNumber - Phone number to validate
   * @returns boolean
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  /**
   * Check if Twilio service is properly configured
   * @returns boolean
   */
  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.serviceSid);
  }

  /**
   * Get service status
   * @returns Service configuration status
   */
  getStatus() {
    return {
      configured: this.isConfigured(),
      demoMode: !this.isConfigured() || import.meta.env.MODE === 'development',
      accountSid: this.accountSid ? this.accountSid.substring(0, 10) + '...' : 'Not set',
      serviceSid: this.serviceSid ? this.serviceSid.substring(0, 10) + '...' : 'Not set'
    };
  }
}

// Export singleton instance
export const twilioService = new TwilioService();
export default twilioService;
