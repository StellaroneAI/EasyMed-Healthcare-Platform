import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ABHAProfile, ABHAHealthRecord, abhaService } from '../services/abhaService';

interface ABHAContextType {
  abhaProfile: ABHAProfile | null;
  healthRecords: ABHAHealthRecord[];
  isABHAConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connectABHA: (profile: ABHAProfile) => void;
  disconnectABHA: () => void;
  fetchHealthRecords: () => Promise<void>;
  clearError: () => void;
}

const ABHAContext = createContext<ABHAContextType | undefined>(undefined);

interface ABHAProviderProps {
  children: ReactNode;
}

export function ABHAProvider({ children }: ABHAProviderProps) {
  const [abhaProfile, setABHAProfile] = useState<ABHAProfile | null>(null);
  const [healthRecords, setHealthRecords] = useState<ABHAHealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the ABHA connection state from the authenticated server session.
  useEffect(() => {
    fetch('/api/abha/session')
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data?.profile) setABHAProfile(data.profile); })
      .catch(() => undefined);
  }, []);

  const connectABHA = (profile: ABHAProfile) => {
    setABHAProfile(profile);
    fetch('/api/abha/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    }).catch(() => undefined);
    setError(null);
  };

  const disconnectABHA = () => {
    setABHAProfile(null);
    setHealthRecords([]);
    fetch('/api/abha/session', { method: 'DELETE' }).catch(() => undefined);
    setError(null);
  };

  const fetchHealthRecords = async () => {
    if (!abhaProfile) {
      setError('ABHA profile not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const records = await abhaService.getHealthRecords(abhaProfile.healthId, '');
      setHealthRecords(records);
    } catch (error) {
      console.error('Failed to fetch health records:', error);
      setError('Failed to fetch health records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: ABHAContextType = {
    abhaProfile,
    healthRecords,
    isABHAConnected: !!abhaProfile,
    isLoading,
    error,
    connectABHA,
    disconnectABHA,
    fetchHealthRecords,
    clearError
  };

  return (
    <ABHAContext.Provider value={value}>
      {children}
    </ABHAContext.Provider>
  );
}

export function useABHA(): ABHAContextType {
  const context = useContext(ABHAContext);
  if (context === undefined) {
    throw new Error('useABHA must be used within an ABHAProvider');
  }
  return context;
}  // ABHA connection state is stored on the authenticated server session.
  useEffect(() => {
    fetch('/api/abha/session')
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (data?.profile) setABHAProfile(data.profile); })
      .catch(() => undefined);
  }, []);

  const connectABHA = (profile: ABHAProfile) => {
    setABHAProfile(profile);
    fetch('/api/abha/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    }).catch(() => undefined);
    setError(null);
  };

  const disconnectABHA = () => {
    setABHAProfile(null);
    setHealthRecords([]);
    fetch('/api/abha/session', { method: 'DELETE' }).catch(() => undefined);
    setError(null);
  };

  const fetchHealthRecords = async () => {
    if (!abhaProfile) {
      setError('ABHA profile not found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const records = await abhaService.getHealthRecords(abhaProfile.healthId, '');
      setHealthRecords(records);
    } catch (error) {
      console.error('Failed to fetch health records:', error);
      setError('Failed to fetch health records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: ABHAContextType = {
    abhaProfile,
    healthRecords,
    isABHAConnected: !!abhaProfile,
    isLoading,
    error,
    connectABHA,
    disconnectABHA,
    fetchHealthRecords,
    clearError
  };

  return (
    <ABHAContext.Provider value={value}>
      {children}
    </ABHAContext.Provider>
  );
}

export function useABHA(): ABHAContextType {
  const context = useContext(ABHAContext);
  if (context === undefined) {
    throw new Error('useABHA must be used within an ABHAProvider');
  }
  return context;
}
