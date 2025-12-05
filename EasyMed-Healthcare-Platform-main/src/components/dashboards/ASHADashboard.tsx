import { useState } from 'react';
import LanguageSelector from '../LanguageSelector';
import VoiceInterface from '../VoiceInterface';

interface ASHADashboardProps {
  userInfo: any;
  onLogout: () => void;
}

export default function ASHADashboard({ userInfo, onLogout }: ASHADashboardProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const assignedPatients = [
    {
      id: 1,
      name: 'Kamala Devi',
      age: 28,
      village: 'Ramanathapuram',
      condition: 'Pregnancy - 7 months',
      lastVisit: '2025-01-25',
      nextVisit: '2025-01-30',
      priority: 'High'
    },
    {
      id: 2,
      name: 'Ravi Kumar',
      age: 45,
      village: 'Thanjavur',
      condition: 'Diabetes monitoring',
      lastVisit: '2025-01-20',
      nextVisit: '2025-02-03',
      priority: 'Medium'
    },
    {
      id: 3,
      name: 'Lakshmi Sundaram',
      age: 35,
      village: 'Kumbakonam',
      condition: 'Hypertension',
      lastVisit: '2025-01-22',
      nextVisit: '2025-01-29',
      priority: 'Medium'
    }
  ];

  const healthPrograms = [
    {
      name: 'Immunization Drive',
      date: '2025-02-01',
      location: 'Community Center',
      target: '0-5 years children',
      registered: 25,
      completed: 0
    },
    {
      name: 'Maternal Health Checkup',
      date: '2025-01-30',
      location: 'Primary Health Center',
      target: 'Pregnant women',
      registered: 12,
      completed: 0
    },
    {
      name: 'Diabetes Screening',
      date: '2025-02-05',
      location: 'Village Square',
      target: 'Adults 35+',
      registered: 18,
      completed: 0
    }
  ];

  const resources = [
    {
      type: 'Medicine Stock',
      item: 'Iron & Folic Acid Tablets',
      current: 120,
      required: 200,
      status: 'Low'
    },
    {
      type: 'Equipment',
      item: 'Digital Thermometer',
      current: 2,
      required: 3,
      status: 'Adequate'
    },
    {
      type: 'Medicine Stock',
      item: 'ORS Packets',
      current: 85,
      required: 100,
      status: 'Good'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">EasyMedPro</h1>
                  <p className="text-green-100 text-sm">Community Health Platform</p>
                </div>
              </div>
              <span className="ml-4 px-4 py-2 bg-green-500/30 backdrop-blur-sm text-green-100 rounded-full text-sm font-medium border border-green-300/30">
                ASHA Worker Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <VoiceInterface className="hidden sm:block" />
              <div className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {userInfo?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="hidden sm:block">
                  Welcome, {userInfo?.name || 'ASHA Worker'}
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
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                {[
                  { id: 'overview', name: 'Dashboard Overview', icon: '📊' },
                  { id: 'patients', name: 'My Patients', icon: '👥' },
                  { id: 'programs', name: 'Health Programs', icon: '🏥' },
                  { id: 'video-support', name: 'Video Consultation', icon: '📹' },
                  { id: 'resources', name: 'Resources & Stock', icon: '📦' },
                  { id: 'training', name: 'Training & Updates', icon: '📚' },
                  { id: 'reports', name: 'Monthly Reports', icon: '📋' },
                  { id: 'profile', name: 'My Profile', icon: '👤' }
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                        activeSection === item.id
                          ? 'bg-green-100 text-green-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">ASHA Worker Dashboard</h2>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="text-3xl">👥</div>
                      <div className="ml-4">
                        <p className="text-gray-600">Assigned Patients</p>
                        <p className="text-2xl font-bold text-gray-900">{assignedPatients.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="text-3xl">🏥</div>
                      <div className="ml-4">
                        <p className="text-gray-600">Active Programs</p>
                        <p className="text-2xl font-bold text-gray-900">{healthPrograms.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="text-3xl">⚠️</div>
                      <div className="ml-4">
                        <p className="text-gray-600">High Priority</p>
                        <p className="text-2xl font-bold text-red-600">
                          {assignedPatients.filter(p => p.priority === 'High').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="text-3xl">📦</div>
                      <div className="ml-4">
                        <p className="text-gray-600">Stock Alerts</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {resources.filter(r => r.status === 'Low').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <span className="text-red-600">🏃‍♀️</span>
                      <span className="text-gray-800">Visit Kamala Devi (Pregnancy checkup)</span>
                      <span className="text-gray-500 text-sm ml-auto">High Priority</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600">💉</span>
                      <span className="text-gray-800">Immunization drive preparation</span>
                      <span className="text-gray-500 text-sm ml-auto">Tomorrow</span>
                    </div>
                  </div>
                </div>

                {/* Government Schemes Update */}
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-lg border border-pink-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Muthulakshmi Reddy Scheme Update</h3>
                  <p className="text-gray-700 mb-3">
                    New pregnant women in your area are eligible for ₹18,000 assistance. Help them apply!
                  </p>
                  <div className="flex space-x-3">
                    <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                      View Eligible Women
                    </button>
                    <button className="bg-white text-pink-600 px-4 py-2 rounded-lg border border-pink-300 hover:bg-pink-50 transition-colors">
                      Download Forms
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'patients' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Patients</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Add New Patient
                  </button>
                </div>

                <div className="grid gap-4">
                  {assignedPatients.map((patient) => (
                    <div key={patient.id} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-gray-600">Age: {patient.age} | Village: {patient.village}</p>
                          <p className="text-gray-700 mt-1">{patient.condition}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-600">Last Visit: {patient.lastVisit}</p>
                            <p className="text-gray-600">Next Visit: {patient.nextVisit}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            patient.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {patient.priority} Priority
                          </span>
                          <div className="mt-2 space-y-2">
                            <button className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Update Record
                            </button>
                            <button className="block w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                              Video Call
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'programs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Health Programs</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Create New Program
                  </button>
                </div>

                <div className="grid gap-6">
                  {healthPrograms.map((program, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-700">📅 Date: {program.date}</p>
                            <p className="text-gray-700">📍 Location: {program.location}</p>
                            <p className="text-gray-700">🎯 Target: {program.target}</p>
                            <p className="text-gray-700">👥 Registered: {program.registered}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="space-y-2">
                            <button className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Manage Program
                            </button>
                            <button className="block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                              Send Reminders
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'video-support' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Video Consultation Support</h2>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📹</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Help Patients Connect with Doctors</h3>
                    <p className="text-gray-600 mb-6">Assist patients in setting up and joining video consultations</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                      <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                        Schedule for Patient
                      </button>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Join as Support
                      </button>
                    </div>
                    
                    <div className="mt-8 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Your Role in Video Consultations:</h4>
                      <ul className="text-left text-gray-700 space-y-1">
                        <li>• Help patients schedule appointments</li>
                        <li>• Assist with technical setup and connectivity</li>
                        <li>• Translate between patient and doctor if needed</li>
                        <li>• Follow up on treatment instructions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'resources' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Resources & Stock</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Request Supplies
                  </button>
                </div>

                <div className="grid gap-4">
                  {resources.map((resource, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{resource.item}</h3>
                          <p className="text-gray-600">{resource.type}</p>
                          <p className="text-gray-700 mt-1">Current: {resource.current} | Required: {resource.required}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            resource.status === 'Low' ? 'bg-red-100 text-red-800' :
                            resource.status === 'Good' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {resource.status}
                          </span>
                          {resource.status === 'Low' && (
                            <button className="block mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                              Request Urgent
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
