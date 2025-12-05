import { useState } from 'react';
import LanguageSelector from '../LanguageSelector';
import VoiceInterface from '../VoiceInterface';
import FloatingMenu from '../FloatingMenu';
import VitalDashboard from '../VitalDashboard';
import ConsultationBooking from '../ConsultationBooking';
import SymptomChecker from '../SymptomChecker';
import HealthAnalytics from '../HealthAnalytics';
import MedicationManager from '../MedicationManager';
import EmergencySystem from '../EmergencySystem';

interface PatientDashboardProps {
  userInfo: any;
  onLogout: () => void;
}

export default function PatientDashboard({ userInfo, onLogout }: PatientDashboardProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Rajesh Kumar',
      specialty: 'General Medicine',
      date: '2025-01-30',
      time: '10:00 AM',
      status: 'Confirmed',
      type: 'Video Consultation'
    },
    {
      id: 2,
      doctor: 'Dr. Priya Sharma',
      specialty: 'Gynecology',
      date: '2025-02-05',
      time: '2:30 PM',
      status: 'Pending',
      type: 'In-person'
    }
  ];

  const healthRecords = [
    {
      id: 1,
      date: '2025-01-20',
      type: 'Blood Test',
      doctor: 'Dr. Rajesh Kumar',
      findings: 'Normal blood parameters',
      prescription: 'Vitamin D supplements'
    },
    {
      id: 2,
      date: '2025-01-15',
      type: 'General Checkup',
      doctor: 'Dr. Priya Sharma',
      findings: 'Blood pressure slightly elevated',
      prescription: 'Low sodium diet, regular exercise'
    }
  ];

  const governmentSchemes = [
    {
      name: 'Ayushman Bharat',
      description: 'Health insurance coverage up to ₹5 lakh',
      eligibility: 'BPL families',
      status: 'Eligible',
      coverage: '₹5,00,000'
    },
    {
      name: 'Muthulakshmi Reddy Maternity Assistance',
      description: 'Financial assistance for pregnant women in Tamil Nadu',
      eligibility: 'Pregnant women in Tamil Nadu',
      status: userInfo?.state === 'Tamil Nadu' ? 'Eligible' : 'Not Eligible',
      coverage: '₹18,000'
    },
    {
      name: 'Janani Suraksha Yojana',
      description: 'Safe motherhood intervention scheme',
      eligibility: 'Pregnant women below poverty line',
      status: 'Eligible',
      coverage: '₹1,400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header with Gradient */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">EasyMedPro</h1>
                  <p className="text-blue-100 text-sm">Your Healthcare Companion</p>
                </div>
              </div>
              <span className="ml-4 px-4 py-2 bg-blue-500/30 backdrop-blur-sm text-blue-100 rounded-full text-sm font-medium border border-blue-300/30">
                Patient Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <LanguageSelector />

              {/* Voice Interface */}
              <VoiceInterface className="hidden sm:block" />

              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {userInfo?.name?.charAt(0) || 'P'}
                  </span>
                </div>
                <span className="hidden sm:block">
                  Welcome, {userInfo?.name || 'Patient'}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-400/30"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Modern Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <h3 className="text-center font-semibold text-gray-800">
                  {userInfo?.name || 'Patient Dashboard'}
                </h3>
                <p className="text-center text-sm text-gray-600">
                  {userInfo?.email || 'Healthcare Portal'}
                </p>
              </div>

              <ul className="space-y-2">
                {[
                  { id: 'overview', name: 'Dashboard', icon: '📊', color: 'from-blue-500 to-blue-600' },
                  { id: 'vital-dashboard', name: 'Vital Signs', icon: '💓', color: 'from-red-500 to-pink-600' },
                  { id: 'symptom-checker', name: 'AI Symptom Checker', icon: '🤖', color: 'from-purple-500 to-indigo-600' },
                  { id: 'health-analytics', name: 'Health Analytics', icon: '📈', color: 'from-green-500 to-emerald-600' },
                  { id: 'medication-manager', name: 'Medications', icon: '💊', color: 'from-blue-500 to-cyan-600' },
                  { id: 'consultation-booking', name: 'Book Consultation', icon: '🩺', color: 'from-teal-500 to-green-600' },
                  { id: 'emergency-system', name: 'Emergency', icon: '🚨', color: 'from-red-600 to-red-700' },
                  { id: 'appointments', name: 'Appointments', icon: '📅', color: 'from-green-500 to-green-600' },
                  { id: 'health-records', name: 'Health Records', icon: '📋', color: 'from-purple-500 to-purple-600' },
                  { id: 'video-consultation', name: 'Video Calls', icon: '📹', color: 'from-red-500 to-red-600' },
                  { id: 'government-schemes', name: 'Gov. Schemes', icon: '🏛️', color: 'from-yellow-500 to-orange-500' },
                  { id: 'asha-support', name: 'ASHA Support', icon: '🏥', color: 'from-teal-500 to-cyan-600' },
                  { id: 'profile', name: 'My Profile', icon: '⚙️', color: 'from-gray-500 to-gray-600' }
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 group ${
                        activeSection === item.id
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                          : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activeSection === item.id
                            ? 'bg-white/20'
                            : `bg-gradient-to-r ${item.color} text-white group-hover:scale-110 transition-transform`
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Voice Interface for Mobile */}
              <div className="mt-6 sm:hidden">
                <VoiceInterface />
              </div>
            </nav>
          </div>

          {/* Main Content with Modern Cards */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Card with Avatar */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <span className="text-3xl">👋</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        Welcome back, {userInfo?.name || 'Patient'}!
                      </h2>
                      <p className="text-blue-100 text-lg">
                        How are you feeling today? Your health is our priority.
                      </p>
                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-sm">System Online</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                          <span className="text-sm">🏥 Healthcare Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Upcoming Appointments</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">2</p>
                        <p className="text-green-600 text-sm mt-1">📅 Next: Tomorrow 10 AM</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl text-white">📅</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Health Records</p>
                        <p className="text-3xl font-bold text-purple-600 mt-1">
                          {healthRecords.length}
                        </p>
                        <p className="text-green-600 text-sm mt-1">📋 All updated</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl text-white">📋</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Available Schemes</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">
                          {governmentSchemes.filter((s) => s.status === 'Eligible').length}
                        </p>
                        <p className="text-green-600 text-sm mt-1">🏛️ Ready to apply</p>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl text-white">🏛️</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions with Beautiful Cards */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-3">⚡</span>
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      {
                        icon: '📹',
                        title: 'Video Call',
                        desc: 'Start consultation',
                        color: 'from-red-500 to-pink-500'
                      },
                      {
                        icon: '📅',
                        title: 'Book Appointment',
                        desc: 'Schedule visit',
                        color: 'from-blue-500 to-cyan-500'
                      },
                      {
                        icon: '💊',
                        title: 'Prescriptions',
                        desc: 'View medicines',
                        color: 'from-green-500 to-teal-500'
                      },
                      {
                        icon: '🏥',
                        title: 'ASHA Support',
                        desc: 'Get help',
                        color: 'from-purple-500 to-indigo-500'
                      }
                    ].map((action, index) => (
                      <button
                        key={index}
                        className={`p-6 rounded-2xl bg-gradient-to-br ${action.color} text-white hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
                      >
                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                          {action.icon}
                        </div>
                        <h4 className="font-bold text-lg">{action.title}</h4>
                        <p className="text-sm opacity-90">{action.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity with Modern Design */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <span className="mr-3">📈</span>
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">✅</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">Blood test results uploaded</p>
                        <p className="text-green-600 text-sm">All parameters normal • 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">📅</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          Appointment scheduled with Dr. Rajesh Kumar
                        </p>
                        <p className="text-blue-600 text-sm">Video consultation • 3 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appointments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Book New Appointment
                  </button>
                </div>

                <div className="grid gap-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.doctor}
                          </h3>
                          <p className="text-gray-600">{appointment.specialty}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-700">
                              📅 {appointment.date} at {appointment.time}
                            </p>
                            <p className="text-gray-700">🏥 {appointment.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              appointment.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {appointment.status}
                          </span>
                          {appointment.type === 'Video Consultation' && (
                            <button className="block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Join Video Call
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'video-consultation' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <span className="mr-3">📹</span>
                    Video Consultation
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                      <span className="text-4xl">📹</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Connect with Healthcare Professionals</h3>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                      Experience seamless video consultations with doctors, with ASHA worker support for
                      language assistance and cultural context.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg">
                        <div className="text-2xl mb-2">🎥</div>
                        <div className="font-bold">Join Scheduled Call</div>
                        <div className="text-sm opacity-90">Dr. Rajesh Kumar • 10:00 AM</div>
                      </button>

                      <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg font-bold">
                        <div className="text-2xl mb-2">📅</div>
                        <div>Schedule New Call</div>
                        <div className="text-sm opacity-70">Book with available doctors</div>
                      </button>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-xl mb-2">🌍</div>
                        <div className="font-semibold">12 Languages</div>
                        <div className="text-xs opacity-80">Multilingual support</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-xl mb-2">🏥</div>
                        <div className="font-semibold">ASHA Support</div>
                        <div className="text-xs opacity-80">Local health worker assistance</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-xl mb-2">📱</div>
                        <div className="font-semibold">Any Device</div>
                        <div className="text-xs opacity-80">Phone, tablet, computer</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Features */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">How Video Consultation Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        step: '1',
                        icon: '📅',
                        title: 'Schedule',
                        desc: 'Book appointment with preferred doctor'
                      },
                      {
                        step: '2',
                        icon: '📱',
                        title: 'Prepare',
                        desc: 'Receive call link and instructions'
                      },
                      {
                        step: '3',
                        icon: '🎥',
                        title: 'Connect',
                        desc: 'Join video call at scheduled time'
                      },
                      {
                        step: '4',
                        icon: '💊',
                        title: 'Follow-up',
                        desc: 'Get prescription and next steps'
                      }
                    ].map((item) => (
                      <div key={item.step} className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl text-white">{item.icon}</span>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'government-schemes' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Government Health Schemes</h2>

                <div className="grid gap-6">
                  {governmentSchemes.map((scheme, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{scheme.name}</h3>
                          <p className="text-gray-600 mt-1">{scheme.description}</p>
                          <div className="mt-3 space-y-2">
                            <p className="text-gray-700">
                              <span className="font-medium">Eligibility:</span> {scheme.eligibility}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Coverage:</span> {scheme.coverage}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              scheme.status === 'Eligible'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {scheme.status}
                          </span>
                          {scheme.status === 'Eligible' && (
                            <button className="block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special highlight for Muthulakshmi Reddy scheme if eligible */}
                {userInfo?.state === 'Tamil Nadu' && (
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-lg border border-pink-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🎯 Special Scheme for Tamil Nadu
                    </h3>
                    <p className="text-gray-700">
                      As a resident of Tamil Nadu, you're eligible for the{' '}
                      <strong>Muthulakshmi Reddy Maternity Assistance Scheme</strong>. This scheme
                      provides ₹18,000 financial assistance for pregnant women.
                    </p>
                    <button className="mt-3 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                      Learn More &amp; Apply
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'health-records' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Health Records</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Upload Document
                  </button>
                </div>

                <div className="grid gap-4">
                  {healthRecords.map((record) => (
                    <div key={record.id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{record.type}</h3>
                          <p className="text-gray-600">By {record.doctor}</p>
                          <p className="text-gray-500 text-sm">📅 {record.date}</p>
                          <div className="mt-3">
                            <p className="text-gray-700">
                              <span className="font-medium">Findings:</span> {record.findings}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-medium">Prescription:</span> {record.prescription}
                            </p>
                          </div>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New AI-Powered Features */}
            {activeSection === 'vital-dashboard' && <VitalDashboard />}

            {activeSection === 'symptom-checker' && <SymptomChecker />}

            {activeSection === 'health-analytics' && <HealthAnalytics />}

            {activeSection === 'medication-manager' && <MedicationManager />}

            {activeSection === 'consultation-booking' && <ConsultationBooking />}

            {activeSection === 'emergency-system' && <EmergencySystem />}
          </div>
        </div>
      </div>

      {/* Floating Action Menu */}
      <FloatingMenu onMenuSelect={setActiveSection} activeMenu={activeSection} />
    </div>
  );
}