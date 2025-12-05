import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useABHA } from '../contexts/ABHAContext';

interface ASHAWorker {
  id: string;
  name: string;
  location: string;
  specialization: string[];
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  rating: number;
  totalConsultations: number;
  languages: string[];
}

interface TelehealthSession {
  sessionId: string;
  patientName: string;
  ashaWorkerName: string;
  scheduledTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  sessionType: 'CONSULTATION' | 'MONITORING' | 'EDUCATION';
}

export default function ASHAWorkerHub() {
  const { currentLanguage } = useLanguage();
  const { abhaProfile, isABHAConnected } = useABHA();
  const [ashaWorkers, setAshaWorkers] = useState<ASHAWorker[]>([]);
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<ASHAWorker | null>(null);
  const [sessionType, setSessionType] = useState<'CONSULTATION' | 'MONITORING' | 'EDUCATION'>('CONSULTATION');

  // ASHA Worker Hub translations
  const ashaTexts = {
    english: {
      title: "👩‍⚕️ ASHA Worker Telehealth Hub",
      subtitle: "Connect with certified ASHA workers in your area",
      findASHA: "Find ASHA Worker",
      mySessions: "My Sessions",
      bookSession: "Book Session",
      available: "Available",
      busy: "Busy",
      offline: "Offline",
      consultation: "Health Consultation",
      monitoring: "Health Monitoring", 
      education: "Health Education",
      rating: "Rating",
      consultations: "Consultations",
      languages: "Languages",
      location: "Location",
      specialization: "Specialization",
      maternal: "Maternal Health",
      childHealth: "Child Health",
      chronicDiseases: "Chronic Diseases",
      mentalHealth: "Mental Health",
      immunization: "Immunization",
      nutrition: "Nutrition",
      familyPlanning: "Family Planning",
      elderCare: "Elder Care",
      connectNow: "Connect Now",
      scheduleSession: "Schedule Session",
      joinSession: "Join Session",
      sessionHistory: "Session History",
      noSessions: "No sessions scheduled",
      selectWorker: "Select ASHA Worker",
      selectType: "Select Session Type",
      selectTime: "Select Time",
      bookNow: "Book Now",
      cancel: "Cancel",
      today: "Today",
      tomorrow: "Tomorrow",
      ashaGuidance: "Get personalized health guidance from certified ASHA workers",
      villageCoverage: "Village-level healthcare coverage",
      localSupport: "Local language support available"
    },
    hindi: {
      title: "👩‍⚕️ आशा कार्यकर्ता टेलीहेल्थ हब",
      subtitle: "अपने क्षेत्र के प्रमाणित आशा कार्यकर्ताओं से जुड़ें",
      findASHA: "आशा कार्यकर्ता खोजें",
      mySessions: "मेरे सत्र",
      bookSession: "सत्र बुक करें",
      available: "उपलब्ध",
      busy: "व्यस्त",
      offline: "ऑफलाइन",
      consultation: "स्वास्थ्य परामर्श",
      monitoring: "स्वास्थ्य निगरानी",
      education: "स्वास्थ्य शिक्षा",
      rating: "रेटिंग",
      consultations: "परामर्श",
      languages: "भाषाएं",
      location: "स्थान",
      specialization: "विशेषज्ञता",
      maternal: "मातृ स्वास्थ्य",
      childHealth: "बाल स्वास्थ्य",
      chronicDiseases: "पुरानी बीमारियां",
      mentalHealth: "मानसिक स्वास्थ्य",
      immunization: "टीकाकरण",
      nutrition: "पोषण",
      familyPlanning: "परिवार नियोजन",
      elderCare: "बुजुर्ग देखभाल",
      connectNow: "अभी जुड़ें",
      scheduleSession: "सत्र शेड्यूल करें",
      joinSession: "सत्र में शामिल हों",
      sessionHistory: "सत्र इतिहास",
      noSessions: "कोई सत्र निर्धारित नहीं",
      selectWorker: "आशा कार्यकर्ता चुनें",
      selectType: "सत्र प्रकार चुनें",
      selectTime: "समय चुनें",
      bookNow: "अभी बुक करें",
      cancel: "रद्द करें",
      today: "आज",
      tomorrow: "कल",
      ashaGuidance: "प्रमाणित आशा कार्यकर्ताओं से व्यक्तिगत स्वास्थ्य मार्गदर्शन प्राप्त करें",
      villageCoverage: "गांव स्तर पर स्वास्थ्य सेवा कवरेज",
      localSupport: "स्थानीय भाषा समर्थन उपलब्ध"
    },
    tamil: {
      title: "👩‍⚕️ ஆஷா ஊழியர் டெலிஹெல்த் மையம்",
      subtitle: "உங்கள் பகுதியில் உள்ள சான்றளிக்கப்பட்ட ஆஷா ஊழியர்களுடன் இணைந்து கொள்ளுங்கள்",
      findASHA: "ஆஷா ஊழியரைக் கண்டறியவும்",
      mySessions: "எனது அமர்வுகள்",
      bookSession: "அமர்வு முன்பதிவு",
      available: "கிடைக்கிறது",
      busy: "பிஸி",
      offline: "ஆஃப்லைன்",
      consultation: "சுகாதார ஆலோசனை",
      monitoring: "சுகாதார கண்காணிப்பு",
      education: "சுகாதார கல்வி",
      rating: "மதிப்பீடு",
      consultations: "ஆலோசனைகள்",
      languages: "மொழிகள்",
      location: "இடம்",
      specialization: "நிபுணத்துவம்",
      maternal: "தாய்மை சுகாதாரம்",
      childHealth: "குழந்தை சுகாதாரம்",
      chronicDiseases: "நாட்பட்ட நோய்கள்",
      mentalHealth: "மனநலம்",
      immunization: "தடுப்பூசி",
      nutrition: "ஊட்டச்சத்து",
      familyPlanning: "குடும்ப கட்டுப்பாடு",
      elderCare: "முதியோர் பராமரிப்பு",
      connectNow: "இப்போதே இணைக்கவும்",
      scheduleSession: "அமர்வு திட்டமிடவும்",
      joinSession: "அமர்வில் சேரவும்",
      sessionHistory: "அமர்வு வரலாறு",
      noSessions: "எந்த அமர்வும் திட்டமிடப்படவில்லை",
      selectWorker: "ஆஷா ஊழியரைத் தேர்ந்தெடுக்கவும்",
      selectType: "அமர்வு வகையைத் தேர்ந்தெடுக்கவும்",
      selectTime: "நேரத்தைத் தேர்ந்தெடுக்கவும்",
      bookNow: "இப்போதே முன்பதிவு செய்யவும்",
      cancel: "ரத்து செய்",
      today: "இன்று",
      tomorrow: "நாளை",
      ashaGuidance: "சான்றளிக்கப்பட்ட ஆஷா ஊழியர்களிடமிருந்து தனிப்பட்ட சுகாதார வழிகாட்டுதலைப் பெறுங்கள்",
      villageCoverage: "கிராம அளவிலான சுகாதார கவரேஜ்",
      localSupport: "உள்ளூர் மொழி ஆதரவு கிடைக்கிறது"
    }
  };

  const getASHAText = (key: keyof typeof ashaTexts.english): string => {
    return ashaTexts[currentLanguage as keyof typeof ashaTexts]?.[key] || ashaTexts.english[key];
  };

  // Mock ASHA workers data
  const mockASHAWorkers: ASHAWorker[] = [
    {
      id: 'asha1',
      name: 'Lakshmi Devi',
      location: 'Thiruvallur District',
      specialization: ['maternal', 'childHealth', 'nutrition'],
      availability: 'AVAILABLE',
      rating: 4.8,
      totalConsultations: 245,
      languages: ['Tamil', 'Hindi', 'English']
    },
    {
      id: 'asha2',
      name: 'Priya Sharma',
      location: 'Kancheepuram District',
      specialization: ['chronicDiseases', 'elderCare', 'mentalHealth'],
      availability: 'AVAILABLE',
      rating: 4.9,
      totalConsultations: 312,
      languages: ['Tamil', 'Telugu', 'English']
    },
    {
      id: 'asha3',
      name: 'Kavitha Rani',
      location: 'Vellore District',
      specialization: ['immunization', 'familyPlanning', 'childHealth'],
      availability: 'BUSY',
      rating: 4.7,
      totalConsultations: 198,
      languages: ['Tamil', 'Kannada', 'Hindi']
    }
  ];

  useEffect(() => {
    setAshaWorkers(mockASHAWorkers);
    // Load sessions for connected ABHA profile
    if (isABHAConnected && abhaProfile) {
      loadTelehealthSessions();
    }
  }, [isABHAConnected, abhaProfile]);

  const loadTelehealthSessions = async () => {
    // Mock sessions data
    const mockSessions: TelehealthSession[] = [
      {
        sessionId: 'session1',
        patientName: abhaProfile?.name || 'User',
        ashaWorkerName: 'Lakshmi Devi',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'SCHEDULED',
        sessionType: 'CONSULTATION'
      },
      {
        sessionId: 'session2',
        patientName: abhaProfile?.name || 'User',
        ashaWorkerName: 'Priya Sharma',
        scheduledTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        status: 'COMPLETED',
        sessionType: 'MONITORING'
      }
    ];
    setSessions(mockSessions);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'BUSY': return 'bg-yellow-100 text-yellow-800';
      case 'OFFLINE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `${getASHAText('today')} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${getASHAText('tomorrow')} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
  };

  const handleBookSession = async () => {
    if (!selectedWorker || !sessionType) return;

    setIsLoading(true);
    try {
      // Simulate booking
      const newSession: TelehealthSession = {
        sessionId: `session_${Date.now()}`,
        patientName: abhaProfile?.name || 'User',
        ashaWorkerName: selectedWorker.name,
        scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        status: 'SCHEDULED',
        sessionType
      };
      
      setSessions([newSession, ...sessions]);
      setShowBooking(false);
      setSelectedWorker(null);
    } catch (error) {
      console.error('Failed to book session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-white/90 to-indigo-50/80 backdrop-blur-lg p-6 rounded-2xl border border-white/30 shadow-xl">
      {/* Modern Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl">👩‍⚕️</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {getASHAText('title')}
            </h3>
            <p className="text-sm text-gray-600">{getASHAText('subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowBooking(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-semibold hover:scale-105 active:scale-95"
        >
          {getASHAText('bookSession')}
        </button>
      </div>

      {/* Enhanced Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { 
            icon: '🏥', 
            label: getASHAText('villageCoverage'), 
            gradient: 'from-green-400 to-emerald-400',
            bgGradient: 'from-green-50 to-emerald-50'
          },
          { 
            icon: '🗣️', 
            label: getASHAText('localSupport'), 
            gradient: 'from-purple-400 to-pink-400',
            bgGradient: 'from-purple-50 to-pink-50'
          },
          { 
            icon: '👩‍⚕️', 
            label: getASHAText('ashaGuidance'), 
            gradient: 'from-orange-400 to-yellow-400',
            bgGradient: 'from-orange-50 to-yellow-50'
          }
        ].map((card, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-br ${card.bgGradient} p-4 rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer`}
          >
            <div className="text-center">
              <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                <span className="text-white text-xl">{card.icon}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Available ASHA Workers */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">{getASHAText('findASHA')}</h4>
        <div className="space-y-3">
          {ashaWorkers.map((worker) => (
            <div key={worker.id} className="bg-white/50 p-4 rounded-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                      👩‍⚕️
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium truncate">{worker.name}</h5>
                      <p className="text-xs text-gray-600">{worker.location}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getAvailabilityColor(worker.availability)}`}>
                          {getASHAText(worker.availability.toLowerCase() as keyof typeof ashaTexts.english)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ⭐ {worker.rating} • {worker.totalConsultations} {getASHAText('consultations')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-500 mb-1">{getASHAText('specialization')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {worker.specialization.map((spec, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {getASHAText(spec as keyof typeof ashaTexts.english)}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-500 mt-2">{getASHAText('languages')}: {worker.languages.join(', ')}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  {worker.availability === 'AVAILABLE' ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedWorker(worker);
                          setShowBooking(true);
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-all"
                      >
                        {getASHAText('connectNow')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWorker(worker);
                          setShowBooking(true);
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-all"
                      >
                        {getASHAText('scheduleSession')}
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-3 py-1 rounded text-xs cursor-not-allowed"
                    >
                      {getASHAText('busy')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Sessions */}
      <div>
        <h4 className="font-medium mb-3">{getASHAText('mySessions')}</h4>
        {sessions.length === 0 ? (
          <div className="text-center py-6 bg-white/30 rounded-lg">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-gray-600 text-sm">{getASHAText('noSessions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.sessionId} className="bg-white/50 p-3 rounded-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{session.ashaWorkerName}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {getASHAText(session.sessionType.toLowerCase() as keyof typeof ashaTexts.english)} • {formatTime(session.scheduledTime)}
                    </p>
                  </div>
                  {session.status === 'SCHEDULED' && (
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-all">
                      {getASHAText('joinSession')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{getASHAText('bookSession')}</h3>
            
            {selectedWorker && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedWorker.name}</p>
                <p className="text-sm text-gray-600">{selectedWorker.location}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{getASHAText('selectType')}</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as typeof sessionType)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="CONSULTATION">{getASHAText('consultation')}</option>
                  <option value="MONITORING">{getASHAText('monitoring')}</option>
                  <option value="EDUCATION">{getASHAText('education')}</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all"
              >
                {getASHAText('cancel')}
              </button>
              <button
                onClick={handleBookSession}
                disabled={isLoading || !selectedWorker}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Booking...' : getASHAText('bookNow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
