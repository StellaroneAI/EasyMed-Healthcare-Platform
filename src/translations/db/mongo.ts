type DemoUser = {
  name: string;
  email: string;
  health: {
    heartRate: number;
    bloodPressure: string;
    medications: string[];
    nextAppointment: string;
  };
};

const STORAGE_KEY = 'easymed_demo_users';

export async function connectDB() {
  return {
    collection: () => ({
      toArray: async () => getDemoUsers(),
      insertOne: async (user: DemoUser) => ({ insertedId: user.email })
    })
  };
}

export async function addDemoUser() {
  const users = await getDemoUsers();
  const demoUser: DemoUser = {
    name: 'Rajesh',
    email: 'rajesh@example.com',
    health: {
      heartRate: 72,
      bloodPressure: '120/80',
      medications: ['Amlodipine'],
      nextAppointment: '2025-07-30T15:00:00Z'
    }
  };

  const updated = [...users.filter((user) => user.email !== demoUser.email), demoUser];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return demoUser;
}

export async function getDemoUsers(): Promise<DemoUser[]> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as DemoUser[];
  } catch (error) {
    console.error('Failed to parse demo users from local storage:', error);
    return [];
  }
}
