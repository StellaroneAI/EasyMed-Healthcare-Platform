import { useLanguage } from '../../contexts/LanguageContext';
import SimpleVoiceAssistant from '../SimpleVoiceAssistant';
import LanguageSelector from '../LanguageSelector';
import LanguageDebugger from '../LanguageDebugger';

interface PatientSpecificDashboardProps {
  user: {
    userType: 'patient';
    name: string;
  };
}

export default function PatientSpecificDashboard({ user }: PatientSpecificDashboardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Language Debug Panel */}
      <LanguageDebugger />
      
      {/* Language Selector */}
      <div className="flex justify-end">
        <LanguageSelector />
      </div>

      {/* Patient Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">{t('welcomeBack')}, {user.name}</h2>
        <p className="text-blue-100">{t('healthCompanion')}</p>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('heartRate')}</p>
              <p className="text-2xl font-bold text-gray-800">72 BPM</p>
              <p className="text-green-600 text-sm">{t('normal')}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('bloodPressure')}</p>
              <p className="text-2xl font-bold text-gray-800">120/80</p>
              <p className="text-green-600 text-sm">{t('normal')}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🩺</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('nextAppointment')}</p>
              <p className="text-lg font-bold text-gray-800">{t('today3pm')}</p>
              <p className="text-blue-600 text-sm">{t('drSharma')}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('medications')}</p>
              <p className="text-2xl font-bold text-gray-800">3</p>
              <p className="text-orange-600 text-sm">{t('dueToday')}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions for Patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">🤖</span>
          <span className="font-semibold">{t('aiSymptomChecker')}</span>
        </button>
        
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">📅</span>
          <span className="font-semibold">{t('bookAppointment')}</span>
        </button>
        
        <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">🚨</span>
          <span className="font-semibold">{t('emergency108')}</span>
        </button>
        
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">👨‍👩‍👧‍👦</span>
          <span className="font-semibold">{t('familyHealth')}</span>
        </button>
      </div>

      {/* AI Health Insights for Patients */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('aiHealthInsights')}</h3>
        <div className="space-y-3">
          <p className="text-gray-700">{t('goodMorning')}</p>
          <p className="text-gray-600">{t('vitalsGreat')}</p>
          <p className="text-blue-600">💊 {t('medications')}</p>
          <p className="text-green-600">⏰ {t('nextCheckup')}</p>
        </div>
      </div>

      {/* AI Voice Assistant */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <SimpleVoiceAssistant 
          userName={user.name}
          onCommand={(command) => {
            console.log('Voice command:', command);
            // Handle navigation based on voice commands
          }}
        />
      </div>
    </div>
  );
}
