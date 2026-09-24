import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  designation: string;
  role: 'super_admin' | 'admin' | 'manager' | 'coordinator';
  permissions: string[];
  createdAt: Date;
  isActive: boolean;
}

interface AdminContextType {
  currentAdmin: AdminUser | null;
  adminTeam: AdminUser[];
  isAdminAuthenticated: boolean;
  isSuperAdmin: boolean;
  loginAdmin: (identifier: string, userInfo?: any, password?: string) => Promise<boolean>;
  logoutAdmin: () => void;
  addTeamMember: (memberData: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<boolean>;
  updateTeamMember: (id: string, updates: Partial<AdminUser>) => Promise<boolean>;
  removeTeamMember: (id: string) => Promise<boolean>;
  checkPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

const DEFAULT_PERMISSIONS = {
  super_admin: ['manage_all_users','manage_team','view_all_data','edit_all_data','delete_all_data','system_settings','analytics','financial_reports','user_management','role_management'],
  admin: ['manage_users','view_data','edit_data','analytics','user_management','reports'],
  manager: ['view_data','edit_data','manage_assigned_users','reports'],
  coordinator: ['view_data','basic_edit','basic_reports'],
};

function mapAdmin(data: any): AdminUser {
  const role = ['super_admin','admin','manager','coordinator'].includes(data.user.role) ? data.user.role : 'admin';
  return {
    id: data.user.userId || data.user.id,
    name: data.user.name || 'EasyMed Administrator',
    phone: data.user.phone || '',
    email: data.user.email,
    designation: 'System Administrator',
    role,
    permissions: role === 'super_admin' ? DEFAULT_PERMISSIONS.super_admin : DEFAULT_PERMISSIONS.admin,
    createdAt: new Date(),
    isActive: true,
  };
}

function mapTeam(data: any): AdminUser[] {
  return Array.isArray(data?.team) ? data.team.map((member: any) => ({
    ...member,
    createdAt: member.createdAt ? new Date(member.createdAt) : new Date(),
  })) : [];
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [adminTeam, setAdminTeam] = useState<AdminUser[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const loadTeam = async () => {
    const response = await fetch('/api/admin/team', { credentials: 'include' });
    if (!response.ok) return;
    setAdminTeam(mapTeam(await response.json()));
  };

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async response => {
        if (!response.ok) return;
        const data = await response.json();
        if (data.authenticated && data.user?.userType === 'admin') {
          setCurrentAdmin(mapAdmin(data));
          setIsAdminAuthenticated(true);
          await loadTeam();
        }
      })
      .catch(() => undefined);
  }, []);

  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const loginAdmin = async (identifier: string, userInfo?: any, password?: string): Promise<boolean> => {
    try {
      const response = password
        ? await fetch('/api/auth/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: identifier, password }),
          })
        : await fetch('/api/auth/me', { credentials: 'include' });
      if (!response.ok) return false;
      const data = await response.json();
      if (!data.user || data.user.userType !== 'admin') return false;
      setCurrentAdmin(mapAdmin(data));
      setIsAdminAuthenticated(true);
      await loadTeam();
      return true;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setCurrentAdmin(null);
    setAdminTeam([]);
    setIsAdminAuthenticated(false);
  };

  const addTeamMember = async (memberData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    const response = await fetch('/api/admin/team', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData),
    });
    if (!response.ok) return false;
    setAdminTeam(mapTeam(await response.json()));
    return true;
  };

  const updateTeamMember = async (id: string, updates: Partial<AdminUser>): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    const response = await fetch('/api/admin/team', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
    if (!response.ok) return false;
    setAdminTeam(mapTeam(await response.json()));
    return true;
  };

  const removeTeamMember = async (id: string): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    const response = await fetch('/api/admin/team', {
      method: 'DELETE', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) return false;
    setAdminTeam(mapTeam(await response.json()));
    return true;
  };

  const checkPermission = (permission: string) =>
    !!currentAdmin && (isSuperAdmin || currentAdmin.permissions.includes(permission));

  return (
    <AdminContext.Provider value={{
      currentAdmin, adminTeam, isAdminAuthenticated, isSuperAdmin, loginAdmin,
      logoutAdmin, addTeamMember, updateTeamMember, removeTeamMember, checkPermission,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
