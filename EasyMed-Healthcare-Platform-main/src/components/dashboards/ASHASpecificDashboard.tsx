import { useLanguage } from '../../contexts/LanguageContext';

interface ASHASpecificDashboardProps {
  user: {
    userType: 'asha';
    name: string;
  };
}

export default function ASHASpecificDashboard({ user }: ASHASpecificDashboardProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* ASHA Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-2xl">
        <h2 className="text-2xl font-bold">Welcome ASHA Worker, {user.name}</h2>
        <p className="text-green-100">Community Health Facilitator Dashboard</p>
      </div>

      {/* ASHA Work Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Patients Visited Today</p>
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-green-600 text-sm">+3 from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">ABHA Registrations</p>
              <p className="text-2xl font-bold text-gray-800">8</p>
              <p className="text-blue-600 text-sm">This week</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🆔</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Immunizations</p>
              <p className="text-2xl font-bold text-gray-800">5</p>
              <p className="text-purple-600 text-sm">Completed today</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💉</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Health Screenings</p>
              <p className="text-2xl font-bold text-gray-800">15</p>
              <p className="text-orange-600 text-sm">This month</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🩺</span>
            </div>
          </div>
        </div>
      </div>

      {/* ASHA Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">🆔</span>
          <span className="font-semibold">ABHA Registration</span>
        </button>
        
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">👥</span>
          <span className="font-semibold">Patient Outreach</span>
        </button>
        
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">💉</span>
          <span className="font-semibold">Immunization Tracker</span>
        </button>
        
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl hover:shadow-lg transition-all">
          <span className="text-2xl mb-2 block">📊</span>
          <span className="font-semibold">Health Reports</span>
        </button>
      </div>

      {/* ABHA Integration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🆔</span>
          ABHA (Ayushman Bharat Health Account) Hub
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl">
            <h4 className="font-semibold text-blue-700">New Registrations</h4>
            <p className="text-2xl font-bold text-blue-800">23</p>
            <p className="text-sm text-gray-600">This month</p>
          </div>
          <div className="bg-white p-4 rounded-xl">
            <h4 className="font-semibold text-green-700">Verified Accounts</h4>
            <p className="text-2xl font-bold text-green-800">156</p>
            <p className="text-sm text-gray-600">Total active</p>
          </div>
          <div className="bg-white p-4 rounded-xl">
            <h4 className="font-semibold text-purple-700">Linked Services</h4>
            <p className="text-2xl font-bold text-purple-800">89</p>
            <p className="text-sm text-gray-600">Healthcare connections</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-semibold">Home Visit - Rajesh Kumar</p>
              <p className="text-sm text-gray-600">Blood pressure check + ABHA setup</p>
            </div>
            <span className="text-sm font-medium text-green-600">10:00 AM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-semibold">Community Health Camp</p>
              <p className="text-sm text-gray-600">Village Center - Immunization drive</p>
            </div>
            <span className="text-sm font-medium text-blue-600">2:00 PM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div>
              <p className="font-semibold">Data Entry & Reports</p>
              <p className="text-sm text-gray-600">Update patient records in system</p>
            </div>
            <span className="text-sm font-medium text-purple-600">4:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
