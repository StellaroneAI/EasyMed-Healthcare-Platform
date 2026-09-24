import { useState } from 'react';
import PatientDashboard from './components/dashboards/PatientDashboard';
import ASHADashboard from './components/dashboards/ASHADashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import LoginPage from './components/LoginPage';
import TeamManagement from './components/TeamManagement';
import SystemStatus from './components/SystemStatus';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { LanguageKey } from './translations';
import './App.css';

interface User {
  userType: 'patient' | 'asha' | 'doctor' | 'admin';
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showTeamManagement, setShowTeamManagement] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(true);
  const { currentAdmin, logoutAdmin, loginAdmin } = useAdmin();
  const { currentLanguage, setLanguage } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const languageOptions = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'hindi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'tamil', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'telugu', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bengali', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'marathi', name: 'मराठी', flag: '🇮🇳' },
    { code: 'punjabi', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'gujarati', name: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kannada', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'malayalam', name: 'മലയാളം', flag: '🇮🇳' },
    { code: 'odia', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'assamese', name: 'অসমীয়া', flag: '🇮🇳' }
  ];

  const handleLogin = (userType: 'patient' | 'asha' | 'doctor' | 'admin', userInfo: any) => {
    const newUser = {
      userType,
      name: userInfo.name,
      phone: userInfo.phone,
      email: userInfo.email,
      role: userInfo.role
    };
    
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    
    // If admin login, also authenticate in AdminContext
    if (userType === 'admin') {
      const identifier = userInfo.email || userInfo.phone || userInfo.phoneNumber;
      if (identifier) {
        setTimeout(async () => {
          try {
            await loginAdmin(identifier, userInfo);
          } catch (error) {
            console.log('Admin context login error:', error);
          }
        }, 0);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowTeamManagement(false);
    if (currentUser?.userType === 'admin') {
      logoutAdmin();
    }
  };

  // Don't force early return - let the component render the main content
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - only show for admin, positioned to not interfere with dashboard */}
      {currentUser.userType === 'admin' && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {currentAdmin?.name?.charAt(0) || currentUser.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h2 className="font-semibold">Welcome, {currentAdmin?.name || currentUser.name}</h2>
                <p className="text-sm text-blue-100">{currentAdmin?.designation || 'Administrator'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select 
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value as LanguageKey)}
                  className="appearance-none bg-white/20 border border-white/30 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-gray-800">
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              <button
                onClick={() => setShowTeamManagement(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>👥</span>
                <span>Manage Team</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={currentUser.userType === 'admin' ? 'pt-20' : ''}>
        {/* Render appropriate dashboard based on user type */}
        {currentUser.userType === 'patient' && (
          <PatientDashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.userType === 'asha' && (
          <ASHADashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.userType === 'doctor' && (
          <DoctorDashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        {currentUser.userType === 'admin' && (
          <AdminDashboard userInfo={currentUser} onLogout={handleLogout} />
        )}
        
        {/* Team Management Modal */}
        {showTeamManagement && (
          <TeamManagement onClose={() => setShowTeamManagement(false)} />
        )}
        
        {/* System Status Notification */}
        {showSystemStatus && (
          <SystemStatus onClose={() => setShowSystemStatus(false)} />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
