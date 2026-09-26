import { useEffect, useState } from 'react';
import VoiceAssistant from '../components/VoiceAssistant';
import ABHAIntegration from '../components/ABHAIntegration';
import FamilyManagement from '../components/FamilyManagement';
import TelemedicineConsultation from '../components/TelemedicineConsultation';
import InsuranceClaims from '../components/InsuranceClaims';
import ASHAWorkerHub from '../components/ASHAWorkerHub';
import RemotePatientMonitoring from '../components/RemotePatientMonitoring';
import PatientEducationLibrary from '../components/PatientEducationLibrary';
import FloatingNavigation from '../components/FloatingNavigation';
import AIChatAssistant from '../components/AIChatAssistant';
import MovableFloatingButton from '../components/MovableFloatingButton';
import { useLanguage } from '../contexts/LanguageContext';
import { clinicalDataService, VitalRecord, MedicationRecord, Appointment } from '../services/clinicalDataService';

interface PatientDashboardProps { userInfo?: { name?: string; phone?: string; email?: string }; onLogout?: () => void; }

export default function PatientDashboard({ userInfo, onLogout }: PatientDashboardProps) {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [userName, setUserName] = useState(userInfo?.name || '');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user?.name) setUserName(data.user.name);
    }).catch(() => undefined);
  }, []);
  
  // State for managing different features
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatType, setChatType] = useState<'SYMPTOM_CHECK' | 'GENERAL_HEALTH' | 'MEDICATION' | 'EMERGENCY'>('SYMPTOM_CHECK');
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingClinical, setLoadingClinical] = useState({ vitals: false, meds: false, appts: false });
  const [clinicalError, setClinicalError] = useState<{ vitals?: string; meds?: string; appts?: string }>({});

  const loadVitals = async () => {
    setLoadingClinical(prev => ({ ...prev, vitals: true }));
    setClinicalError(prev => ({ ...prev, vitals: undefined }));
    const res = await clinicalDataService.getVitals();
    if (res.error) setClinicalError(prev => ({ ...prev, vitals: res.error }));
    else setVitals(res.vitals || []);
    setLoadingClinical(prev => ({ ...prev, vitals: false }));
  };

  const loadMedications = async () => {
    setLoadingClinical(prev => ({ ...prev, meds: true }));
    setClinicalError(prev => ({ ...prev, meds: undefined }));
    const res = await clinicalDataService.getMedications();
    if (res.error) setClinicalError(prev => ({ ...prev, meds: res.error }));
    else setMedications(res.medications || []);
    setLoadingClinical(prev => ({ ...prev, meds: false }));
  };

  const loadAppointments = async () => {
    setLoadingClinical(prev => ({ ...prev, appts: true }));
    setClinicalError(prev => ({ ...prev, appts: undefined }));
    const res = await clinicalDataService.getAppointments();
    if (res.error) setClinicalError(prev => ({ ...prev, appts: res.error }));
    else setAppointments(res.appointments || []);
    setLoadingClinical(prev => ({ ...prev, appts: false }));
  };

  useEffect(() => {
    loadVitals();
    loadMedications();
    loadAppointments();
  }, []);

  const latestVital = vitals[0];
  const nextAppointment = appointments.find(a => a.status === 'scheduled' || a.status === 'confirmed');

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const languages = {
    english: 'English',
    hindi: 'हिंदी', 
    tamil: 'தமிழ்',
    telugu: 'తెలుగు',
    bengali: 'বাংলা',
    marathi: 'मराठी',
    punjabi: 'ਪੰਜਾਬੀ'
  } as const;

  // Action handlers for quick actions
  const handleAISymptomCheck = () => {
    setChatType('SYMPTOM_CHECK');
    setShowAIChat(true);
  };

  const handleBookAppointment = () => {
    setActiveSection('appointments');
    // Scroll to ASHA Worker Hub or show appointment booking
    const ashaSection = document.getElementById('asha-worker-hub');
    if (ashaSection) {
      ashaSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEmergencyCall = () => {
    if (confirm('This will call emergency services (108). Continue?')) {
      window.open('tel:108');
    }
  };

  const handleFamilyHealth = () => {
    setActiveSection('family');
    const familySection = document.getElementById('family-management');
    if (familySection) {
      familySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTelemedicine = () => {
    setActiveSection('telemedicine');
    const telemedicineSection = document.getElementById('telemedicine-consultation');
    if (telemedicineSection) {
      telemedicineSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMedicineReminder = () => {
    setChatType('MEDICATION');
    setShowAIChat(true);
  };

  const handleHealthRecords = () => {
    setActiveSection('records');
    const abhaSection = document.getElementById('abha-integration');
    if (abhaSection) {
      abhaSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFindHospital = () => {
    // Open maps or hospital finder
    const query = encodeURIComponent('hospital near me');
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  const handleHealthGoals = () => {
    setActiveSection('monitoring');
    const monitoringSection = document.getElementById('remote-monitoring');
    if (monitoringSection) {
      monitoringSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHealthEducation = () => {
    setActiveSection('education');
    const educationSection = document.getElementById('patient-education');
    if (educationSection) {
      educationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Floating button handlers
  const handleDoctorCall = () => {
    setActiveSection('telemedicine');
    const telemedicineSection = document.getElementById('telemedicine-consultation');
    if (telemedicineSection) {
      telemedicineSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMedicineCheck = () => {
    setChatType('MEDICATION');
    setShowAIChat(true);
  };

  const handleVitalsCheck = () => {
    setActiveSection('monitoring');
    const monitoringSection = document.getElementById('remote-monitoring');
    if (monitoringSection) {
      monitoringSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-cyan-100 pb-20">
      {/* Modern Mobile-First Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/30 shadow-xl">
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-xl">🏥</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  {t('welcomeBack')}{userName ? `, ${userName}` : ''}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{t('healthCompanion')}</p>
              </div>
            </div>
            
            {/* Enhanced Language Selector */}
            <div className="flex items-center space-x-3">
              <select 
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as import('../translations').LanguageKey)}
                className="px-3 py-2 text-xs sm:text-sm border-0 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg min-w-[90px] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.entries(languages).map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
              
              {/* Notification Bell */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-white text-sm">🔔</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Enhanced Spacing */}
      <main className="px-4 pt-6 space-y-6 sm:px-6 sm:space-y-8">
        {/* Voice Assistant */}
        <VoiceAssistant />

        {/* Health Status Cards - Mobile Grid with Live Persistence, Error & Retry */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Heart Rate Card */}
          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20 touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm text-gray-600 truncate">{t('heartRate')}</h3>
                {loadingClinical.vitals ? (
                  <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                ) : clinicalError.vitals ? (
                  <div>
                    <p className="text-xs text-red-500">Failed to load</p>
                    <button onClick={loadVitals} className="text-xs text-blue-600 underline font-medium">Retry</button>
                  </div>
                ) : latestVital?.heartRate ? (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{latestVital.heartRate} bpm</p>
                    <p className="text-xs text-green-600">Normal</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-400">—</p>
                    <p className="text-xs text-gray-400">Not recorded</p>
                  </>
                )}
              </div>
              <div className="text-red-500 text-lg sm:text-xl ml-2">❤️</div>
            </div>
          </div>

          {/* Blood Pressure Card */}
          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20 touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm text-gray-600 truncate">{t('bloodPressure')}</h3>
                {loadingClinical.vitals ? (
                  <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                ) : clinicalError.vitals ? (
                  <div>
                    <p className="text-xs text-red-500">Failed to load</p>
                    <button onClick={loadVitals} className="text-xs text-blue-600 underline font-medium">Retry</button>
                  </div>
                ) : latestVital?.bloodPressure ? (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">
                      {latestVital.bloodPressure.systolic}/{latestVital.bloodPressure.diastolic}
                    </p>
                    <p className="text-xs text-green-600">mmHg</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-400">—</p>
                    <p className="text-xs text-gray-400">Not recorded</p>
                  </>
                )}
              </div>
              <div className="text-blue-500 text-lg sm:text-xl ml-2">🩺</div>
            </div>
          </div>

          {/* Next Appointment Card */}
          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20 touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm text-gray-600 truncate">{t('nextAppointment')}</h3>
                {loadingClinical.appts ? (
                  <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                ) : clinicalError.appts ? (
                  <div>
                    <p className="text-xs text-red-500">Failed to load</p>
                    <button onClick={loadAppointments} className="text-xs text-blue-600 underline font-medium">Retry</button>
                  </div>
                ) : nextAppointment ? (
                  <>
                    <p className="text-sm sm:text-base font-bold text-gray-800">
                      {new Date(nextAppointment.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-purple-600 truncate">{nextAppointment.type || 'Consultation'}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm sm:text-lg font-bold text-gray-400">—</p>
                    <p className="text-xs text-gray-400">No appointment scheduled</p>
                  </>
                )}
              </div>
              <div className="text-purple-500 text-lg sm:text-xl ml-2">📅</div>
            </div>
          </div>

          {/* Medications Card */}
          <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20 touch-manipulation">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm text-gray-600 truncate">{t('medications')}</h3>
                {loadingClinical.meds ? (
                  <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                ) : clinicalError.meds ? (
                  <div>
                    <p className="text-xs text-red-500">Failed to load</p>
                    <button onClick={loadMedications} className="text-xs text-blue-600 underline font-medium">Retry</button>
                  </div>
                ) : medications.length > 0 ? (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{medications.length} Active</p>
                    <p className="text-xs text-orange-600 truncate">{medications[0].name}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl sm:text-2xl font-bold text-gray-400">—</p>
                    <p className="text-xs text-gray-400">No active medications</p>
                  </>
                )}
              </div>
              <div className="text-orange-500 text-lg sm:text-xl ml-2">💊</div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions - Mobile Grid */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">⚡</span>
            </div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { 
                icon: '🤖', 
                label: t('aiSymptomChecker'), 
                gradient: 'from-blue-500 to-cyan-500',
                bgGradient: 'from-blue-50 to-cyan-50',
                onClick: handleAISymptomCheck
              },
              { 
                icon: '📱', 
                label: t('bookAppointment'), 
                gradient: 'from-green-500 to-emerald-500',
                bgGradient: 'from-green-50 to-emerald-50',
                onClick: handleBookAppointment
              },
              { 
                icon: '🚑', 
                label: t('emergency108'), 
                gradient: 'from-red-500 to-pink-500',
                bgGradient: 'from-red-50 to-pink-50',
                onClick: handleEmergencyCall
              },
              { 
                icon: '👨‍👩‍👧‍👦', 
                label: t('familyHealth'), 
                gradient: 'from-purple-500 to-indigo-500',
                bgGradient: 'from-purple-50 to-indigo-50',
                onClick: handleFamilyHealth
              }
            ].map((action) => (
              <button 
                key={action.label}
                onClick={action.onClick}
                className={`bg-gradient-to-br ${action.bgGradient} backdrop-blur-sm border border-white/30 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation group`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-white text-lg">{action.icon}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 leading-tight">
                    {action.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Enhanced AI Health Insights */}
        <section className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-lg p-6 rounded-2xl border border-white/30 shadow-xl">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🧠</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 ml-3">{t('aiHealthInsights')}</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">💡</span>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-gray-700">
                  <strong className="text-blue-700">Health data</strong> will appear here once your connected records are available.
                </p>
                
                {/* Progress indicators */}
                <div className="mt-4 rounded-xl bg-white/60 p-4 text-sm text-gray-600">
                  No health score, goals, or activity streak has been calculated yet.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABHA Integration */}
        <div id="abha-integration">
          <ABHAIntegration />
        </div>

        {/* ASHA Worker Telehealth Hub */}
        <div id="asha-worker-hub">
          <ASHAWorkerHub />
        </div>

        {/* Remote Patient Monitoring */}
        <div id="remote-monitoring">
          <RemotePatientMonitoring />
        </div>

        {/* Family Management */}
        <div id="family-management">
          <FamilyManagement />
        </div>

        {/* Telemedicine Consultations */}
        <div id="telemedicine-consultation">
          <TelemedicineConsultation />
        </div>

        {/* Insurance Claims */}
        <InsuranceClaims />

        {/* Patient Education Library */}
        <div id="patient-education">
          <PatientEducationLibrary />
        </div>

        {/* Family overview will be populated from authenticated family records. */}
        <section className="bg-white/80 p-6 rounded-2xl border border-white/30 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t('familyHealthTitle')}</h2>
          <p className="text-sm text-gray-600">No family members are currently loaded.</p>
        </section>

        <section className="bg-white/80 p-6 rounded-2xl border border-white/30 shadow-xl">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 ml-3">{t('recentActivity')}</h2>
          <p className="text-sm text-gray-600 mt-2">No recent activity is available yet.</p>
        </section>

        {/* Voice Assistant */}
        <VoiceAssistant />
      </main>

      {/* AI Chat Assistant */}
      <AIChatAssistant 
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        chatType={chatType}
      />

      {/* Floating Navigation */}
      <FloatingNavigation />

      {/* Movable Floating Button */}
      <MovableFloatingButton
        onQuickAction={(action) => { if (action === 'emergency') handleEmergencyCall(); else if (action === 'doctor') handleDoctorCall(); else if (action === 'medicine') handleMedicineCheck(); else handleVitalsCheck(); }}
      />
    </div>
  );
}
