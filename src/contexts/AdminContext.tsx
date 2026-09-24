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

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [adminTeam, setAdminTeam] = useState<AdminUser[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async response => {
        if (!response.ok) return null;
        const data = await response.json();
        if (data.authenticated && data.user?.userType === 'admin') {
          const user: AdminUser = {
            id: data.user.userId,
            name: data.user.name,
            phone: data.user.phone || '',
            email: data.user.email,
            designation: 'System Administrator',
            role: data.user.role === 'super_admin' ? 'super_admin' : 'admin',
            permissions: data.user.role === 'super_admin' ? DEFAULT_PERMISSIONS.super_admin : DEFAULT_PERMISSIONS.admin,
            createdAt: new Date(),
            isActive: true,
          };
          setCurrentAdmin(user);
          setIsAdminAuthenticated(true);
        }
      })
      .catch(() => undefined);

    const savedTeam = localStorage.getItem('easymed_admin_team');
    if (savedTeam) {
      try { setAdminTeam(JSON.parse(savedTeam)); } catch { localStorage.removeItem('easymed_admin_team'); }
    }
  }, []);

  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const loginAdmin = async (identifier: string, userInfo?: any, password?: string): Promise<boolean> => {
    try {
      let response: Response;
      if (password) {
        response = await fetch('/api/auth/admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: identifier, password }),
        });
      } else {
        response = await fetch('/api/auth/me', { credentials: 'include' });
      }
      if (!response.ok) return false;
      const data = await response.json();
      if (!data.user) return false;
      const admin: AdminUser = {
        id: data.user.id,
        name: data.user.name || userInfo?.name || 'EasyMed Administrator',
        phone: data.user.phone || userInfo?.phone || '',
        email: data.user.email || userInfo?.email,
        designation: 'System Administrator',
        role: data.user.role === 'super_admin' ? 'super_admin' : 'admin',
        permissions: data.user.role === 'super_admin' ? DEFAULT_PERMISSIONS.super_admin : DEFAULT_PERMISSIONS.admin,
        createdAt: new Date(),
        isActive: true,
      };
      setCurrentAdmin(admin);
      setIsAdminAuthenticated(true);
      return true;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setCurrentAdmin(null);
    setIsAdminAuthenticated(false);
  };

  const addTeamMember = async (memberData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!isSuperAdmin && currentAdmin?.role !== 'admin') return false;
    const newMember: AdminUser = {
      ...memberData,
      id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      permissions: DEFAULT_PERMISSIONS[memberData.role] || DEFAULT_PERMISSIONS.coordinator,
      createdAt: new Date(),
    };
    const updatedTeam = [...adminTeam, newMember];
    setAdminTeam(updatedTeam);
    localStorage.setItem('easymed_admin_team', JSON.stringify(updatedTeam));
    return true;
  };

  const updateTeamMember = async (id: string, updates: Partial<AdminUser>): Promise<boolean> => {
    if (!isSuperAdmin && currentAdmin?.role !== 'admin') return false;
    const updatedTeam = adminTeam.map(member => member.id === id ? {
      ...member,
      ...updates,
      permissions: updates.role ? DEFAULT_PERMISSIONS[updates.role] || member.permissions : member.permissions,
    } : member);
    setAdminTeam(updatedTeam);
    localStorage.setItem('easymed_admin_team', JSON.stringify(updatedTeam));
    return true;
  };

  const removeTeamMember = async (id: string): Promise<boolean> => {
    if (!isSuperAdmin) return false;
    const updatedTeam = adminTeam.filter(member => member.id !== id);
    setAdminTeam(updatedTeam);
    localStorage.setItem('easymed_admin_team', JSON.stringify(updatedTeam));
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
