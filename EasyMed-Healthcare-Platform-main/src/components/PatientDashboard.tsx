import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceAssistant from './VoiceAssistant';
import AIChatAssistant from './AIChatAssistant';
import MovableFloatingButton from './MovableFloatingButton';
import ASHAWorkerHub from './ASHAWorkerHub';
import RemotePatientMonitoring from './RemotePatientMonitoring';
import PatientEducationLibrary from './PatientEducationLibrary';
import GovernmentNGODashboard from './GovernmentNGODashboard';
import SidebarMenu from './SidebarMenu';
import LoginPage from './LoginPage';
import PatientSpecificDashboard from './dashboards/PatientSpecificDashboard';
import ASHASpecificDashboard from './dashboards/ASHASpecificDashboard';
import DoctorSpecificDashboard from './dashboards/DoctorSpecificDashboard';
import AdminSpecificDashboard from './dashboards/AdminSpecificDashboard';
import SymptomChecker from './SymptomChecker';
import HealthAnalytics from './HealthAnalytics';
import MedicationManager from './MedicationManager';
import EmergencySystem from './EmergencySystem';
import AIHealthAssistant from './AIHealthAssistant';
import PWAFeatures from './PWAFeatures';
import IoTDeviceIntegration from './IoTDeviceIntegration';
import GeneticHealthInsights from './GeneticHealthInsights';
import PersonalizedWellnessCoaching from './PersonalizedWellnessCoaching';

interface PatientData {
  name: string;
  age: number;
  abhaId: string;
  location: string;
  bloodGroup: string;
  emergencyContact: string;
  chronicConditions: string[];
  lastVisit: string;
  nextAppointment: string;
  medications: string[];
  allergies: string[];
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
    weight: number;
  };
}

interface UserInfo {
  type: 'patient' | 'asha' | 'doctor' | 'admin';
  data: any;
}

interface PatientDashboardProps {
  user?: {
    userType: 'patient' | 'asha' | 'doctor' | 'admin';
    name: string;
  };
}

export default function PatientDashboard({ user }: PatientDashboardProps) {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [healthTip, setHealthTip] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sample patient data
  const [patientData] = useState<PatientData>({
    name: 'Rajesh Kumar',
    age: 45,
    abhaId: 'ABHA-1234567890',
    location: 'Village Rampur, District Bulandshahr, UP',
    bloodGroup: 'B+',
    emergencyContact: '+91-9876543210',
    chronicConditions: ['Diabetes Type 2', 'Hypertension'],
    lastVisit: '2024-01-15',
    nextAppointment: '2024-02-15',
    medications: ['Metformin 500mg', 'Amlodipine 5mg'],
    allergies: ['Penicillin'],
    vitals: {
      heartRate: 78,
      bloodPressure: '130/85',
      temperature: 98.6,
      oxygenSaturation: 97,
      weight: 70
    }
  });

  // Health tips rotation
  const healthTips = {
    english: [
      "💧 Drink at least 8 glasses of water daily to stay hydrated",
      "🚶‍♂️ Take a 30-minute walk daily to maintain heart health",
      "🥗 Include fresh fruits and vegetables in every meal",
      "😴 Get 7-8 hours of quality sleep for better immunity",
      "🧘‍♀️ Practice deep breathing for 10 minutes daily to reduce stress"
    ],
    hindi: [
      "💧 स्वस्थ रहने के लिए दिन में कम से कम 8 गिलास पानी पिएं",
      "🚶‍♂️ हृदय स्वास्थ्य के लिए रोज 30 मिनट टहलें",
      "🥗 हर भोजन में ताजे फल और सब्जियां शामिल करें",
      "😴 बेहतर रोग प्रतिरोधक क्षमता के लिए 7-8 घंटे की गुणवत्तापूर्ण नींद लें",
      "🧘‍♀️ तनाव कम करने के लिए रोज 10 मिनट गहरी सांस लें"
    ],
    tamil: [
      "💧 ஆரோக்கியமாக இருக்க தினமும் குறைந்தது 8 கிளாஸ் தண்ணீர் குடிக்கவும்",
      "🚶‍♂️ இதய ஆரோக்கியத்திற்காக தினமும் 30 நிமிடங்கள் நடக்கவும்",
      "🥗 ஒவ்வொரு உணவிலும் புதிய பழங்கள் மற்றும் காய்கறிகள் சேர்க்கவும்",
      "😴 சிறந்த நோய் எதிர்ப்பு சக்திக்காக 7-8 மணி நேர தரமான தூக்கம்",
      "🧘‍♀️ மன அழுத்தத்தைக் குறைக்க தினமும் 10 நிமிடங்கள் ஆழமான மூச்சு"
    ]
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Rotate health tips every 10 seconds
  useEffect(() => {
    const tips = healthTips[currentLanguage as keyof typeof healthTips] || healthTips.english;
    let tipIndex = 0;
    setHealthTip(tips[0]);
    
    const tipTimer = setInterval(() => {
      tipIndex = (tipIndex + 1) % tips.length;
      setHealthTip(tips[tipIndex]);
    }, 10000);
    
    return () => clearInterval(tipTimer);
  }, [currentLanguage]);

  const handleLogin = (userType: 'patient' | 'asha' | 'doctor' | 'admin', userData: any) => {
    setUserInfo({ type: userType, data: userData });
    setIsLoggedIn(true);
    setCurrentSection('dashboard');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'emergency':
        setCurrentSection('emergency');
        break;
      case 'doctor':
        setCurrentSection('appointments');
        break;
      case 'medicine':
        setCurrentSection('healthRecords');
        break;
      case 'vitals':
        setCurrentSection('vitalsMonitoring');
        break;
      case 'chat':
        setShowChat(true);
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const handleNavigation = (section: string) => {
    setCurrentSection(section);
    setShowChat(false);
  };

  const handleVoiceCommand = (command: string, _language: string) => {
    handleNavigation(command);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const greetings = {
      english: {
        morning: "Good Morning",
        afternoon: "Good Afternoon", 
        evening: "Good Evening"
      },
      hindi: {
        morning: "सुप्रभात",
        afternoon: "नमस्कार",
        evening: "शुभ संध्या"
      },
      tamil: {
        morning: "காலை வணக்கம்",
        afternoon: "மதிய வணக்கம்",
        evening: "மாலை வணக்கம்"
      }
    };

    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    const langGreetings = greetings[currentLanguage as keyof typeof greetings] || greetings.english;
    return langGreetings[timeOfDay];
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderDashboardContent = () => {
    if (!user) return null;

    // Render user-specific dashboard based on user type
    switch (user.userType) {
      case 'patient':
        return <PatientSpecificDashboard user={user as any} />;
      case 'asha':
        return <ASHASpecificDashboard user={user as any} />;
      case 'doctor':
        return <DoctorSpecificDashboard user={user as any} />;
      case 'admin':
        return <AdminSpecificDashboard user={user as any} />;
      default:
        return <PatientSpecificDashboard user={user as any} />;
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'aiChat':
        return <AIChatAssistant isOpen={true} onClose={() => setCurrentSection('dashboard')} chatType="GENERAL_HEALTH" />;
      case 'symptomChecker':
        return <SymptomChecker />;
      case 'healthAnalytics':
        return <HealthAnalytics />;
      case 'medicationManager':
        return <MedicationManager />;
      case 'emergencySystem':
        return <EmergencySystem />;
      case 'pwaFeatures':
        return <PWAFeatures />;
      case 'iotDevices':
        return <IoTDeviceIntegration />;
      case 'geneticInsights':
        return <GeneticHealthInsights />;
      case 'wellnessCoaching':
        return <PersonalizedWellnessCoaching />;
      case 'appointments':
        return (
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Appointment</h2>
            <p className="text-gray-600">Appointment booking feature coming soon...</p>
          </div>
        );
      case 'telemedicine':
        return (
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Telemedicine</h2>
            <p className="text-gray-600">Video consultation feature coming soon...</p>
          </div>
        );
      case 'vitalsMonitoring':
        return <RemotePatientMonitoring />;
      case 'education':
        return <PatientEducationLibrary />;
      case 'ashaWorker':
        return <ASHAWorkerHub />;
      case 'governmentDashboard':
        return <GovernmentNGODashboard />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Collapsible Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-white/90 backdrop-blur-xl border-r border-white/20 transition-all duration-300 z-40 ${
          sidebarOpen || sidebarHovered ? 'w-80' : 'w-16'
        }`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <SidebarMenu
          isOpen={sidebarOpen || sidebarHovered}
          onClose={() => setSidebarOpen(false)}
          onNavigate={handleNavigation}
          currentSection={currentSection}
          userType={user?.userType || 'patient'}
        />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen || sidebarHovered ? 'ml-80' : 'ml-16'}`}>
        {/* Header */}
        <header className={`bg-white/80 backdrop-blur-xl border-b border-white/20 sticky z-30 px-4 lg:px-6 py-4 ${user?.userType === 'admin' ? 'top-20' : 'top-0'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-all"
              >
                <span className="text-gray-600 text-xl">☰</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">🏥</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EasyMed
                  </h1>
                  <p className="text-xs text-gray-500">Your Family's Health, Just a Tap Away</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <select 
                  value={currentLanguage}
                  onChange={(e) => {
                    const languageKey = e.target.value as 'english' | 'hindi' | 'tamil';
                    setLanguage(languageKey);
                  }}
                  className="appearance-none bg-white/50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="english">🇺🇸 English</option>
                  <option value="hindi">🇮🇳 हिंदी</option>
                  <option value="tamil">🇮🇳 தமிழ்</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => {
                  // Clear local storage and reload page to reset state
                  localStorage.clear();
                  window.location.reload();
                }}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm"
                title="Logout"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
              
              <button
                onClick={() => setShowChat(true)}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="text-xl">🤖</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          {renderSectionContent()}
        </main>
      </div>

      {/* Chat Assistant */}
      {showChat && <AIChatAssistant isOpen={showChat} onClose={() => setShowChat(false)} chatType="GENERAL_HEALTH" />}

      {/* Floating Elements */}
      <MovableFloatingButton onQuickAction={handleQuickAction} />
      
      {/* Voice Assistant - Fixed at bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        <VoiceAssistant onCommand={handleVoiceCommand} />
      </div>
    </div>
  );
}
