import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Default permissions for different roles
const DEFAULT_PERMISSIONS = {
  super_admin: [
    'manage_all_users',
    'manage_team',
    'view_all_data',
    'edit_all_data',
    'delete_all_data',
    'system_settings',
    'analytics',
    'financial_reports',
    'user_management',
    'role_management'
  ],
  admin: [
    'manage_users',
    'view_data',
    'edit_data',
    'analytics',
    'user_management',
    'reports'
  ],
  manager: [
    'view_data',
    'edit_data',
    'manage_assigned_users',
    'reports'
  ],
  coordinator: [
    'view_data',
    'basic_edit',
    'basic_reports'
  ]
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [adminTeam, setAdminTeam] = useState<AdminUser[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load admin data from localStorage on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem('easymed_admin');
    const savedTeam = localStorage.getItem('easymed_admin_team');
    
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin);
        setCurrentAdmin(admin);
        setIsAdminAuthenticated(true);
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    }
    
    if (savedTeam) {
      try {
        const team = JSON.parse(savedTeam);
        setAdminTeam(team);
      } catch (error) {
        console.error('Error loading team data:', error);
      }
    }
  }, []);

  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const normalizeIdentifier = (value: string): string => value.replace(/\s+/g, '').toLowerCase();

  const loginAdmin = async (identifier: string, userInfo?: any, password?: string): Promise<boolean> => {
    try {
      const normalizedIdentifier = normalizeIdentifier(identifier);

      // Trusted flow: use authenticated user info from auth service
      if (userInfo?.name && (userInfo?.email || userInfo?.phone)) {
        const teamMember = adminTeam.find((member) => (
          member.isActive &&
          (
            normalizeIdentifier(member.phone) === normalizedIdentifier ||
            (member.email && normalizeIdentifier(member.email) === normalizedIdentifier)
          )
        ));

        const authenticatedAdmin: AdminUser = teamMember || {
          id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          name: userInfo.name,
          phone: userInfo.phone || '',
          email: userInfo.email || undefined,
          designation: userInfo.designation || 'Administrator',
          role: userInfo.role || 'admin',
          permissions: DEFAULT_PERMISSIONS[userInfo.role as keyof typeof DEFAULT_PERMISSIONS] || DEFAULT_PERMISSIONS.admin,
          createdAt: new Date(),
          isActive: true
        };

        setCurrentAdmin(authenticatedAdmin);
        setIsAdminAuthenticated(true);
        localStorage.setItem('easymed_admin', JSON.stringify(authenticatedAdmin));
        return true;
      }

      // Fallback flow: existing team members with active status
      const teamMember = adminTeam.find((member) => (
        member.isActive &&
        (
          normalizeIdentifier(member.phone) === normalizedIdentifier ||
          (member.email && normalizeIdentifier(member.email) === normalizedIdentifier)
        )
      ));

      if (teamMember) {
        setCurrentAdmin(teamMember);
        setIsAdminAuthenticated(true);
        localStorage.setItem('easymed_admin', JSON.stringify(teamMember));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('easymed_admin');
  };

  const addTeamMember = async (memberData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      if (!isSuperAdmin && currentAdmin?.role !== 'admin') {
        throw new Error('Insufficient permissions to add team members');
      }
      
      // Check if phone already exists
      if (adminTeam.some(member => member.phone === memberData.phone)) {
        throw new Error('Phone number already exists');
      }
      
      const newMember: AdminUser = {
        ...memberData,
        id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        permissions: DEFAULT_PERMISSIONS[memberData.role] || DEFAULT_PERMISSIONS.coordinator,
        createdAt: new Date()
      };
      
      const updatedTeam = [...adminTeam, newMember];
      setAdminTeam(updatedTeam);
      localStorage.setItem('easymed_admin_team', JSON.stringify(updatedTeam));
      
      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      return false;
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<AdminUser>): Promise<boolean> => {
    try {
      if (!isSuperAdmin && currentAdmin?.role !== 'admin') {
        throw new Error('Insufficient permissions to update team members');
      }
      
      const updatedTeam = adminTeam.map(member => 
        member.id === id 
          ? { 
              ...member, 
              ...updates,
              permissions: updates.role ? DEFAULT_PERMISSIONS[updates.role] || member.permissions : member.permissions
            }
          : member
      );
      
      setAdminTeam(updatedTeam);
      localStorage.setItem('easymed_admin_team', JSON.stringify(updatedTeam));
      
      return true;
    } catch (error) {
      console.error('Error updating team member:', error);
      return false;
    }
  };

  const removeTeamMember = async (id: string): Promise<boolean> => {
    try {
      if (!isSuperAdmin) {
        throw new Error('Only super admin can remove team members');
      }
      
      const updatedTeam = adminTeam.filter(member => member.id !== id);
      setAdminTeam(updatedTeam);
      localStorage.setItem('easymed_admin_team', JSON.stringify(updatedTeam));
      
      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      return false;
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!currentAdmin) return false;
    return currentAdmin.permissions.includes(permission) || isSuperAdmin;
  };

  const value: AdminContextType = {
    currentAdmin,
    adminTeam,
    isAdminAuthenticated,
    isSuperAdmin,
    loginAdmin,
    logoutAdmin,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    checkPermission
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
