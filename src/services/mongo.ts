const STORAGE_PREFIX = 'easymed_db_';

function readCollection<T>(name: string): T[] {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${name}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch (error) {
    console.error(`Failed to parse ${name} collection:`, error);
    return [];
  }
}

function writeCollection<T>(name: string, data: T[]): void {
  localStorage.setItem(`${STORAGE_PREFIX}${name}`, JSON.stringify(data));
}

export async function connectDB(): Promise<any> {
  return {
    collection: (name: string) => ({
      find: (query: Record<string, unknown> = {}) => {
        const rows = readCollection<any>(name).filter((row) =>
          Object.entries(query).every(([key, value]) => row[key] === value)
        );
        return {
          sort: () => ({ limit: () => ({ skip: () => ({ toArray: async () => rows }) }), toArray: async () => rows }),
          limit: () => ({ skip: () => ({ toArray: async () => rows }) }),
          toArray: async () => rows
        };
      },
      findOne: async (query: Record<string, unknown>) =>
        readCollection<any>(name).find((row) =>
          Object.entries(query).every(([key, value]) => row[key] === value)
        ) || null,
      insertOne: async (doc: Record<string, unknown>) => {
        const rows = readCollection<any>(name);
        rows.push(doc);
        writeCollection(name, rows);
        return { insertedId: (doc as any)?._id || Date.now().toString() };
      },
      countDocuments: async (query: Record<string, unknown> = {}) =>
        readCollection<any>(name).filter((row) =>
          Object.entries(query).every(([key, value]) => row[key] === value)
        ).length,
      createIndex: async () => undefined
    })
  };
}

export async function closeDB(): Promise<void> {}

export interface Patient {
  _id?: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    district: string;
  };
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relation: string;
    };
  };
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
    lastUpdated: Date;
  };
  appointments: string[];
  assignedASHA?: string;
  assignedDoctor?: string;
  language: string;
  schemes: string[];
  isPregnant?: boolean;
  pregnancyInfo?: {
    trimester: number;
    expectedDelivery: Date;
    riskLevel: 'low' | 'medium' | 'high';
    schemes: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ASHAWorker {
  _id?: string;
  ashaId: string;
  name: string;
  phone: string;
  email?: string;
  address: {
    village: string;
    block: string;
    district: string;
    state: string;
    pincode: string;
  };
  assignedArea: {
    villages: string[];
    population: number;
    households: number;
  };
  patients: string[];
  qualifications: string[];
  experience: number;
  language: string[];
  specializations: string[];
  performance: {
    patientsServed: number;
    vaccinationsDone: number;
    healthCheckups: number;
    emergencyResponses: number;
  };
  availability: {
    workingHours: string;
    emergencyAvailable: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor {
  _id?: string;
  doctorId: string;
  name: string;
  phone: string;
  email: string;
  qualification: string;
  specialization: string[];
  experience: number;
  languages: string[];
  address: {
    clinic: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  availability: {
    days: string[];
    timeSlots: string[];
    consultationFee: number;
    videoConsultationFee: number;
  };
  patients: string[];
  ratings: {
    average: number;
    total: number;
    reviews: {
      patientId: string;
      rating: number;
      comment: string;
      date: Date;
    }[];
  };
  telemedicine: {
    enabled: boolean;
    platforms: string[];
    maxPatientsPerDay: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  _id?: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  ashaId?: string;
  type: 'physical' | 'telemedicine' | 'home-visit' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
  dateTime: Date;
  duration: number;
  symptoms: string;
  diagnosis?: string;
  prescription?: {
    medicines: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
    instructions: string;
  };
  followUpDate?: Date;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'free';
  videoCall?: {
    roomId: string;
    platform: string;
    link: string;
  };
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernmentScheme {
  _id?: string;
  schemeId: string;
  name: string;
  nameLocal: string;
  state: string;
  description: string;
  eligibility: {
    ageRange?: { min: number; max: number };
    gender?: string[];
    income?: { max: number };
    pregnancy?: boolean;
    conditions?: string[];
  };
  benefits: string[];
  applicationProcess: string[];
  documents: string[];
  helpline: string;
  website?: string;
  isActive: boolean;
  language: string;
  category: 'pregnancy' | 'child-health' | 'women-health' | 'general' | 'elderly' | 'disability';
  createdAt: Date;
  updatedAt: Date;
}

export class DatabaseService {
  private isConnected = false;

  async connect(): Promise<void> {
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async clearAllData(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    ['patients', 'ashaworkers', 'doctors', 'appointments', 'schemes'].forEach((name) =>
      localStorage.removeItem(`${STORAGE_PREFIX}${name}`)
    );
  }

  async init(): Promise<void> {
    await this.connect();
  }

  private ensureConnection(): void {
    if (!this.isConnected) throw new Error('Database not initialized');
  }

  async createPatient(patient: Omit<Patient, '_id'>): Promise<Patient> {
    this.ensureConnection();
    const rows = readCollection<Patient>('patients');
    const created = { ...patient, _id: generateId('PAT') };
    rows.push(created);
    writeCollection('patients', rows);
    return created;
  }

  async getPatient(patientId: string): Promise<Patient | null> {
    this.ensureConnection();
    return readCollection<Patient>('patients').find((row) => row.patientId === patientId) || null;
  }

  async getPatientByPhone(phone: string): Promise<Patient | null> {
    this.ensureConnection();
    return readCollection<Patient>('patients').find((row) => row.phone === phone) || null;
  }

  async getAllPatients(limit: number = 50, skip: number = 0): Promise<Patient[]> {
    this.ensureConnection();
    return readCollection<Patient>('patients').slice(skip, skip + limit);
  }

  async getPatientsByState(state: string): Promise<Patient[]> {
    this.ensureConnection();
    return readCollection<Patient>('patients').filter((row) => row.address.state === state);
  }

  async getPregnantPatients(state?: string): Promise<Patient[]> {
    this.ensureConnection();
    return readCollection<Patient>('patients').filter((row) => row.isPregnant && (!state || row.address.state === state));
  }

  async createASHA(asha: Omit<ASHAWorker, '_id'>): Promise<ASHAWorker> {
    this.ensureConnection();
    const rows = readCollection<ASHAWorker>('ashaworkers');
    const created = { ...asha, _id: generateId('ASHA') };
    rows.push(created);
    writeCollection('ashaworkers', rows);
    return created;
  }

  async getASHA(ashaId: string): Promise<ASHAWorker | null> {
    this.ensureConnection();
    return readCollection<ASHAWorker>('ashaworkers').find((row) => row.ashaId === ashaId) || null;
  }

  async getAllASHAs(): Promise<ASHAWorker[]> {
    this.ensureConnection();
    return readCollection<ASHAWorker>('ashaworkers');
  }

  async createDoctor(doctor: Omit<Doctor, '_id'>): Promise<Doctor> {
    this.ensureConnection();
    const rows = readCollection<Doctor>('doctors');
    const created = { ...doctor, _id: generateId('DOC') };
    rows.push(created);
    writeCollection('doctors', rows);
    return created;
  }

  async getDoctor(doctorId: string): Promise<Doctor | null> {
    this.ensureConnection();
    return readCollection<Doctor>('doctors').find((row) => row.doctorId === doctorId) || null;
  }

  async getDoctorByEmail(email: string): Promise<Doctor | null> {
    this.ensureConnection();
    return readCollection<Doctor>('doctors').find((row) => row.email === email) || null;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    this.ensureConnection();
    return readCollection<Doctor>('doctors');
  }

  async getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    this.ensureConnection();
    return readCollection<Doctor>('doctors').filter((row) => row.specialization.includes(specialization));
  }

  async createAppointment(appointment: Omit<Appointment, '_id'>): Promise<Appointment> {
    this.ensureConnection();
    const rows = readCollection<Appointment>('appointments');
    const created = { ...appointment, _id: generateId('APT') };
    rows.push(created);
    writeCollection('appointments', rows);
    return created;
  }

  async getAppointment(appointmentId: string): Promise<Appointment | null> {
    this.ensureConnection();
    return readCollection<Appointment>('appointments').find((row) => row.appointmentId === appointmentId) || null;
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    this.ensureConnection();
    return readCollection<Appointment>('appointments').filter((row) => row.patientId === patientId);
  }

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    this.ensureConnection();
    return readCollection<Appointment>('appointments').filter((row) => row.doctorId === doctorId);
  }

  async createScheme(scheme: Omit<GovernmentScheme, '_id'>): Promise<GovernmentScheme> {
    this.ensureConnection();
    const rows = readCollection<GovernmentScheme>('schemes');
    const created = { ...scheme, _id: generateId('SCH') };
    rows.push(created);
    writeCollection('schemes', rows);
    return created;
  }

  async getSchemesByState(state: string): Promise<GovernmentScheme[]> {
    this.ensureConnection();
    return readCollection<GovernmentScheme>('schemes').filter((row) => row.state === state && row.isActive);
  }

  async getPregnancySchemes(state: string): Promise<GovernmentScheme[]> {
    this.ensureConnection();
    return readCollection<GovernmentScheme>('schemes').filter((row) => row.state === state && row.category === 'pregnancy' && row.isActive);
  }

  async getAllSchemes(): Promise<GovernmentScheme[]> {
    this.ensureConnection();
    return readCollection<GovernmentScheme>('schemes').filter((row) => row.isActive);
  }

  async authenticateUser(identifier: string, userType: 'patient' | 'asha' | 'doctor'): Promise<any> {
    this.ensureConnection();
    const sources = {
      patient: readCollection<Patient>('patients'),
      asha: readCollection<ASHAWorker>('ashaworkers'),
      doctor: readCollection<Doctor>('doctors')
    };
    return sources[userType].find((user: any) => user.phone === identifier || user.email === identifier) || null;
  }

  async getDashboardStats(): Promise<any> {
    this.ensureConnection();
    return {
      totalPatients: readCollection<Patient>('patients').length,
      totalASHAs: readCollection<ASHAWorker>('ashaworkers').length,
      totalDoctors: readCollection<Doctor>('doctors').length,
      totalAppointments: readCollection<Appointment>('appointments').length,
      todayAppointments: 0
    };
  }
}

export const dbService = new DatabaseService();

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

export function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
