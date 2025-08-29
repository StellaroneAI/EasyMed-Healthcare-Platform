// Twilio Service for OTP Authentication
// Handles SMS verification for user login

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

class TwilioService {
  private accountSid: string;
  private authToken: string;
  private serviceSid: string;
  private client: any = null;

  constructor() {
    this.accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
    this.authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
    this.serviceSid = import.meta.env.VITE_TWILIO_VERIFY_SERVICE_SID || '';
    
    // Initialize Twilio client only if credentials are available
    if (this.accountSid && this.authToken) {
      this.initializeClient();
    }
  }

  private async initializeClient() {
    try {
      // Import Twilio dynamically to handle browser environment
      const twilio = await import('twilio');
      this.client = twilio.default(this.accountSid, this.authToken);
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
    }
  }

  /**
   * Send OTP to phone number
   * @param phoneNumber - Phone number in E.164 format (+91XXXXXXXXXX)
   * @returns Promise<OTPSendResult>
   */
  async sendOTP(phoneNumber: string): Promise<OTPSendResult> {
    try {
      if (!this.client) {
        // Fallback for development/demo mode
        if (process.env.NODE_ENV === 'development' || !this.accountSid) {
          console.log(`🔧 Demo Mode: OTP sent to ${phoneNumber}`);
          return {
            status: 'pending',
            sid: 'demo_verification_' + Date.now()
          };
        }
        throw new Error('Twilio client not initialized');
      }

      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Invalid phone number format');
      }

      const verification = await this.client.verify.v2
        .services(this.serviceSid)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms'
        });

      return {
        status: verification.status as 'pending' | 'failed',
        sid: verification.sid
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
      if (!this.client) {
        // Fallback for development/demo mode
        if (process.env.NODE_ENV === 'development' || !this.accountSid) {
          console.log(`🔧 Demo Mode: Verifying OTP ${code} for ${phoneNumber}`);
          // Accept any 6-digit code in demo mode
          const isValid = /^\d{6}$/.test(code);
          return {
            status: isValid ? 'approved' : 'failed',
            valid: isValid,
            sid: 'demo_verification_check_' + Date.now()
          };
        }
        throw new Error('Twilio client not initialized');
      }

      const verificationCheck = await this.client.verify.v2
        .services(this.serviceSid)
        .verificationChecks.create({
          to: phoneNumber,
          code: code
        });

      return {
        status: verificationCheck.status,
        valid: verificationCheck.status === 'approved',
        sid: verificationCheck.sid
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
      demoMode: !this.isConfigured() || process.env.NODE_ENV === 'development',
      accountSid: this.accountSid ? this.accountSid.substring(0, 10) + '...' : 'Not set',
      serviceSid: this.serviceSid ? this.serviceSid.substring(0, 10) + '...' : 'Not set'
    };
  }
}

// Export singleton instance
export const twilioService = new TwilioService();
export default twilioService;