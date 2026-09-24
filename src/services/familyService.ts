export interface FamilyMember {
  id: string;
  relationshipType: 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' | 'OTHER';
  healthId: string;
  name: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'O';
  mobile?: string;
  isLinked: boolean;
  consentGiven: boolean;
}

export const familyService = {
  async list(): Promise<FamilyMember[]> {
    const response = await fetch('/api/family/me', { credentials: 'include' });
    if (!response.ok) throw new Error('Unable to load family members.');
    const data = await response.json();
    return Array.isArray(data.family) ? data.family : [];
  },

  async add(member: Omit<FamilyMember, 'id' | 'isLinked' | 'consentGiven'>): Promise<boolean> {
    const response = await fetch('/api/family/me', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    return response.ok;
  },

  async link(id: string, healthId: string): Promise<boolean> {
    const response = await fetch('/api/family/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, healthId, isLinked: true }),
    });
    return response.ok;
  },

  async grantConsent(id: string): Promise<boolean> {
    const response = await fetch('/api/family/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, consentGiven: true }),
    });
    return response.ok;
  },
};
