/**
 * Standardized data service connecting UI components across Patient, Doctor, ASHA,
 * and Admin workflows to MongoDB-backed serverless APIs.
 */

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  ashaId?: string;
  scheduledTime: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
  createdAt?: string;
}

export interface VitalRecord {
  id?: string;
  patientId?: string;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  glucose?: number;
  recordedAt: string;
}

export interface MedicationRecord {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  prescribedBy?: string;
  status?: string;
}

export interface DoctorProfile {
  doctorId: string;
  name: string;
  specialty: string;
  designation?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string;
  email?: string;
  designation: string;
  role: 'super_admin' | 'admin' | 'manager' | 'coordinator';
  permissions: string[];
  isActive: boolean;
}

class ClinicalDataService {
  private async request<T>(path: string, options: RequestInit = {}): Promise<{ data?: T; error?: string }> {
    try {
      const res = await fetch(path, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });

      const body = await res.json();
      if (!res.ok) {
        return { error: body.error || `HTTP ${res.status}` };
      }
      return { data: body };
    } catch (err: any) {
      return { error: err.message || 'Network request failed' };
    }
  }

  // --- Appointments (Patient, Doctor, ASHA, Admin) ---
  async getAppointments(): Promise<{ appointments: Appointment[]; error?: string }> {
    const res = await this.request<{ appointments: Appointment[] }>('/api/appointments/me');
    if (res.error) return { appointments: [], error: res.error };
    return { appointments: res.data?.appointments || [] };
  }

  async createAppointment(appointment: {
    patientId?: string;
    doctorId: string;
    ashaId?: string;
    scheduledTime: string;
    type?: string;
    reason?: string;
    notes?: string;
  }): Promise<{ appointment?: Appointment; error?: string }> {
    const res = await this.request<{ appointment: Appointment }>('/api/appointments/me', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
    if (res.error) return { error: res.error };
    return { appointment: res.data?.appointment };
  }

  async updateAppointment(id: string, updates: {
    status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    scheduledTime?: string;
  }): Promise<{ appointment?: Appointment; error?: string }> {
    const res = await this.request<{ appointment: Appointment }>('/api/appointments/me', {
      method: 'PATCH',
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.error) return { error: res.error };
    return { appointment: res.data?.appointment };
  }

  // --- Vitals ---
  async getVitals(): Promise<{ vitals: VitalRecord[]; error?: string }> {
    const res = await this.request<{ vitals: VitalRecord[] }>('/api/vitals/me');
    if (res.error) return { vitals: [], error: res.error };
    return { vitals: res.data?.vitals || [] };
  }

  async recordVitals(vitals: VitalRecord): Promise<{ success: boolean; error?: string }> {
    const res = await this.request<{ success: boolean }>('/api/vitals/me', {
      method: 'POST',
      body: JSON.stringify(vitals),
    });
    return { success: !res.error, error: res.error };
  }

  // --- Medications ---
  async getMedications(): Promise<{ medications: MedicationRecord[]; error?: string }> {
    const res = await this.request<{ medications: MedicationRecord[] }>('/api/medications/me');
    if (res.error) return { medications: [], error: res.error };
    return { medications: res.data?.medications || [] };
  }

  // --- Doctors Directory ---
  async getDoctors(): Promise<{ doctors: DoctorProfile[]; error?: string }> {
    const res = await this.request<{ doctors: DoctorProfile[] }>('/api/doctors');
    if (res.error) return { doctors: [], error: res.error };
    return { doctors: res.data?.doctors || [] };
  }

  // --- Admin Team Management ---
  async getTeam(): Promise<{ team: TeamMember[]; error?: string }> {
    const res = await this.request<{ team: TeamMember[] }>('/api/admin/team');
    if (res.error) return { team: [], error: res.error };
    return { team: res.data?.team || [] };
  }
}

export const clinicalDataService = new ClinicalDataService();
export default clinicalDataService;
