/**
 * Real Authentication Service
 * Integrates with Twilio for OTP and ABDM for patient data
 */

import { twilioService, OTPVerificationResult } from './twilioService';
import { abhaService, ABHAProfile } from './abhaService';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  profilePhoto?: string;
  isVerified: boolean;
  
  // Type-specific data
  abhaProfile?: ABHAProfile;
  specialty?: string; // for doctors
  village?: string; // for ASHA workers
  organization?: string; // for admins
  
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
  private users: Map<string, User> = new Map();
  private pendingRegistrations: Map<string, UserRegistration> = new Map();
  private otpSessions: Map<string, { phone: string; timestamp: number }> = new Map();

  constructor() {
    this.loadUsersFromStorage();
  }

  /**
   * Send OTP for authentication
   */
  async sendOTP(phoneNumber: string): Promise<AuthResult> {
    try {
      // Format phone number
      const formattedPhone = twilioService.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Send OTP via Twilio
      const result = await twilioService.sendOTP(formattedPhone);
      
      if (result.status === 'pending') {
        // Store OTP session
        this.otpSessions.set(formattedPhone, {
          phone: formattedPhone,
          timestamp: Date.now()
        });

        return { 
          success: true, 
          otpSent: true,
          requiresOTP: true
        };
      } else {
        return { 
          success: false, 
          error: result.errorMessage || 'Failed to send OTP' 
        };
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOTPAndLogin(phoneNumber: string, otp: string): Promise<AuthResult> {
    try {
      const formattedPhone = twilioService.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Check if OTP session exists
      const session = this.otpSessions.get(formattedPhone);
      if (!session) {
        return { success: false, error: 'No OTP session found. Please request a new OTP.' };
      }

      // Check session timeout (5 minutes)
      if (Date.now() - session.timestamp > 5 * 60 * 1000) {
        this.otpSessions.delete(formattedPhone);
        return { success: false, error: 'OTP session expired. Please request a new OTP.' };
      }

      // Verify OTP with Twilio
      const verificationResult = await twilioService.verifyOTP(formattedPhone, otp);
      
      if (!verificationResult.valid) {
        return { 
          success: false, 
          error: verificationResult.errorMessage || 'Invalid OTP' 
        };
      }

      // Clean up OTP session
      this.otpSessions.delete(formattedPhone);

      // Find or create user
      let user = this.findUserByPhone(formattedPhone);
      
      if (!user) {
        // Check if there's a pending registration
        const pendingReg = this.pendingRegistrations.get(formattedPhone);
        if (pendingReg) {
          user = await this.createUser(pendingReg);
          this.pendingRegistrations.delete(formattedPhone);
        } else {
          // Create default patient user
          user = await this.createUser({
            name: `User ${formattedPhone.slice(-4)}`,
            phone: formattedPhone,
            userType: 'patient'
          });
        }
      }

      // Update last login
      user.lastLogin = new Date();
      this.saveUsersToStorage();

      return { success: true, user };

    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return { success: false, error: error.message || 'Failed to verify OTP' };
    }
  }

  /**
   * Register new user (stores in pending until OTP verification)
   */
  async registerUser(registration: UserRegistration): Promise<AuthResult> {
    try {
      const formattedPhone = twilioService.formatPhoneNumber(registration.phone);
      if (!formattedPhone) {
        return { success: false, error: 'Invalid phone number format' };
      }

      // Check if user already exists
      if (this.findUserByPhone(formattedPhone)) {
        return { success: false, error: 'User already exists with this phone number' };
      }

      // Store pending registration
      this.pendingRegistrations.set(formattedPhone, {
        ...registration,
        phone: formattedPhone
      });

      // Send OTP for verification
      return await this.sendOTP(formattedPhone);

    } catch (error: any) {
      console.error('Register user error:', error);
      return { success: false, error: error.message || 'Failed to register user' };
    }
  }

  /**
   * Admin authentication (requires special privileges)
   */
  async authenticateAdmin(identifier: string, password?: string): Promise<AuthResult> {
    try {
      // Check if it's a phone number
      if (/^\+?[1-9]\d{1,14}$/.test(identifier.replace(/\D/g, ''))) {
        // Admin phone authentication
        const formattedPhone = twilioService.formatPhoneNumber(identifier);
        if (!formattedPhone) {
          return { success: false, error: 'Invalid phone number format' };
        }

        // Check against admin phone numbers
        const adminPhones = ['+919060328119']; // Add other admin phones here
        if (!adminPhones.includes(formattedPhone)) {
          return { success: false, error: 'Access denied. Contact system administrator.' };
        }

        // For admin phone, send OTP
        return await this.sendOTP(formattedPhone);
      } else {
        // Email authentication
        const adminEmails = [
          'praveen@stellaronehealth.com',
          'admin@easymed.in',
          'admin@gmail.com'
        ];

        const adminPasswords = ['dummy123', 'admin123', 'easymed2025'];

        if (!adminEmails.includes(identifier)) {
          return { success: false, error: 'Access denied. Contact system administrator.' };
        }

        if (!password || !adminPasswords.includes(password)) {
          return { success: false, error: 'Invalid password' };
        }

        // Create/find admin user
        let adminUser = this.findUserByEmail(identifier);
        if (!adminUser) {
          adminUser = await this.createUser({
            name: identifier === 'praveen@stellaronehealth.com' ? 'Praveen - StellarOne Health' : 'Admin User',
            email: identifier,
            phone: '+919060328119', // Default admin phone
            userType: 'admin',
            organization: identifier === 'praveen@stellaronehealth.com' ? 'StellarOne Health' : 'EasyMed'
          });
        }

        adminUser.lastLogin = new Date();
        this.saveUsersToStorage();

        return { success: true, user: adminUser };
      }

    } catch (error: any) {
      console.error('Admin authentication error:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  /**
   * Link ABHA profile to user account
   */
  async linkABHAProfile(userId: string, abhaProfile: ABHAProfile): Promise<boolean> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return false;
      }

      user.abhaProfile = abhaProfile;
      user.isVerified = true;
      this.saveUsersToStorage();

      return true;
    } catch (error) {
      console.error('Link ABHA profile error:', error);
      return false;
    }
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  /**
   * Get user by phone
   */
  findUserByPhone(phone: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * Get user by email
   */
  findUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  /**
   * Create new user
   */
  private async createUser(registration: UserRegistration): Promise<User> {
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    
    const user: User = {
      id: userId,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      userType: registration.userType,
      specialty: registration.specialty,
      village: registration.village,
      organization: registration.organization,
      isVerified: false,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    this.users.set(userId, user);
    this.saveUsersToStorage();

    return user;
  }

  /**
   * Load users from localStorage
   */
  private loadUsersFromStorage(): void {
    try {
      const stored = localStorage.getItem('easymed_users');
      if (stored) {
        const userData = JSON.parse(stored);
        for (const [id, userObj] of Object.entries(userData)) {
          const user = userObj as any;
          // Convert date strings back to Date objects
          user.createdAt = new Date(user.createdAt);
          user.lastLogin = new Date(user.lastLogin);
          this.users.set(id, user as User);
        }
      }
    } catch (error) {
      console.error('Failed to load users from storage:', error);
    }
  }

  /**
   * Save users to localStorage
   */
  private saveUsersToStorage(): void {
    try {
      const userData = Object.fromEntries(this.users);
      localStorage.setItem('easymed_users', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save users to storage:', error);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      twilioStatus: twilioService.getStatus(),
      totalUsers: this.users.size,
      pendingRegistrations: this.pendingRegistrations.size,
      activeSessions: this.otpSessions.size
    };
  }

  /**
   * Clear all data (admin function)
   */
  clearAllData(): void {
    this.users.clear();
    this.pendingRegistrations.clear();
    this.otpSessions.clear();
    localStorage.removeItem('easymed_users');
  }
}

// Export singleton instance
export const authService = new RealAuthService();
export default authService;