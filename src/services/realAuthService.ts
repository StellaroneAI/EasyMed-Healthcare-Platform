import { twilioService } from './twilioService';
import type { ABHAProfile } from './abhaService';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  profilePhoto?: string;
  isVerified: boolean;
  abhaProfile?: ABHAProfile;
  specialty?: string;
  village?: string;
  organization?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresOTP?: boolean;
  otpSent?: boolean;
}

export interface UserRegistration {
  name: string;
  email?: string;
  phone: string;
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  specialty?: string;
  village?: string;
  organization?: string;
}

class RealAuthService {
  async sendOTP(phoneNumber: string): Promise<AuthResult> {
    const result = await twilioService.sendOTP(phoneNumber);
    return result.status === 'pending'
      ? { success: true, otpSent: true, requiresOTP: true }
      : { success: false, error: result.errorMessage };
  }

  async verifyOTPAndLogin(phoneNumber: string, otp: string, userType: User['userType'] = 'patient', name?: string): Promise<AuthResult> {
    const formatted = twilioService.formatPhoneNumber(phoneNumber);
    if (!formatted) return { success: false, error: 'Invalid phone number format' };
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: formatted, otp, userType, name }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'OTP verification failed' };
      return { success: true, user: { ...data.user, isVerified: true, createdAt: new Date(), lastLogin: new Date() } };
    } catch {
      return { success: false, error: 'Authentication service unavailable' };
    }
  }

  async authenticateAdmin(identifier: string, password?: string): Promise<AuthResult> {
    if (!password) {
      const result = await twilioService.sendOTP(identifier);
      return result.status === 'pending'
        ? { success: true, otpSent: true, requiresOTP: true }
        : { success: false, error: result.errorMessage };
    }
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: identifier, password }),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Admin authentication failed' };
      return { success: true, user: { ...data.user, phone: '', isVerified: true, createdAt: new Date(), lastLogin: new Date() } };
    } catch {
      return { success: false, error: 'Authentication service unavailable' };
    }
  }

  async linkABHAProfile(_userId: string, _abhaProfile: ABHAProfile): Promise<boolean> {
    // ABHA linking is now a server-side operation; this client method remains as a compatibility shim.
    return false;
  }

  async checkSession(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (!data.authenticated || !data.user) return null;
      return {
        id: data.user.userId || data.user.id,
        name: data.user.name || 'User',
        phone: data.user.phone || '',
        email: data.user.email,
        userType: data.user.userType || 'patient',
        isVerified: true,
        role: data.user.role,
        createdAt: new Date(),
        lastLogin: new Date(),
      };
    } catch {
      return null;
    }
  }

  async logout(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getStatus() {
    return { provider: 'Secure API + Twilio Verify', clientStorage: false };
  }
}

export const authService = new RealAuthService();
export default authService;
