import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useABHA } from '../contexts/ABHAContext';

interface VitalSigns {
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  bloodGlucose?: number;
  weight?: number;
  height?: number;
}

interface MonitoringDevice {
  id: string;
  type: 'BLOOD_PRESSURE' | 'GLUCOMETER' | 'PULSE_OXIMETER' | 'THERMOMETER' | 'WEIGHING_SCALE';
  name: string;
  batteryLevel: number;
  isConnected: boolean;
  lastSync: string;
}

interface PatientReading {
  id: string;
  timestamp: string;
  vitals: VitalSigns;
  deviceUsed: string;
  notes?: string;
  alerts: string[];
}

export default function RemotePatientMonitoring() {
  const { currentLanguage, t } = useLanguage();
  const { isABHAConnected } = useABHA();
  const [devices, setDevices] = useState<MonitoringDevice[]>([]);
  const [readings, setReadings] = useState<PatientReading[]>([]);
  const [currentVitals, setCurrentVitals] = useState<VitalSigns | null>(null);
  const [isRecording, setIsRecording] = useState(false);


  useEffect(() => {
    if (!isABHAConnected) {
      setDevices([]);
      setReadings([]);
      setCurrentVitals(null);
      return;
    }

    fetch('/api/vitals/me', { credentials: 'include' })
      .then(async response => response.ok ? response.json() : { readings: [], devices: [] })
      .then(data => {
        const nextReadings = Array.isArray(data.readings) ? data.readings : [];
        setReadings(nextReadings);
        setDevices(Array.isArray(data.devices) ? data.devices : []);
        setCurrentVitals(nextReadings[0]?.vitals || null);
      })
      .catch(() => {
        setReadings([]);
        setDevices([]);
        setCurrentVitals(null);
      });
  }, [isABHAConnected]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'BLOOD_PRESSURE': return '🩺';
      case 'PULSE_OXIMETER': return '💓';
      case 'GLUCOMETER': return '🩸';
      case 'THERMOMETER': return '🌡️';
      case 'WEIGHING_SCALE': return '⚖️';
      default: return '📱';
    }
  };

  const getVitalStatus = (vital: string, value: number): 'normal' | 'high' | 'low' | 'critical' => {
    switch (vital) {
      case 'heartRate':
        if (value < 60) return 'low';
        if (value > 100) return 'high';
        return 'normal';
      case 'temperature':
        if (value < 97) return 'low';
        if (value > 100.4) return 'high';
        if (value > 102) return 'critical';
        return 'normal';
      case 'oxygenSaturation':
        if (value < 90) return 'critical';
        if (value < 95) return 'low';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getVitalColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'high': return 'text-orange-600';
      case 'low': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleSyncDevice = async (deviceId: string) => {
    setIsRecording(true);
    try {
      const response = await fetch('/api/vitals/me', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.readings)) setReadings(data.readings);
        if (Array.isArray(data.devices)) setDevices(data.devices);
        if (Array.isArray(data.readings) && data.readings[0]) setCurrentVitals(data.readings[0].vitals);
      }
    } finally {
      setIsRecording(false);
    }
  };

  if (!isABHAConnected) {
    return (
      <div className="bg-white/70 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/20">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-2">{t('rpmTitle')}</h3>
          <p className="text-gray-600 mb-4">Connect ABHA to access remote monitoring</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-lg p-6 rounded-2xl border border-white/30 shadow-xl">
      {/* Modern Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white text-2xl">📊</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {t('rpmTitle')}
            </h3>
            <p className="text-sm text-gray-600">{t('rpmSubtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`px-6 py-3 rounded-xl transition-all duration-300 text-sm font-semibold hover:scale-105 active:scale-95 shadow-lg ${
            isRecording 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-red-200' 
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-blue-200'
          }`}
        >
          {isRecording ? '🔴 Recording...' : `📈 ${t('recordVitals')}`}
        </button>
      </div>

      {/* Device Kit Info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200 mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📦</div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-800">{t('deviceKit')}</h4>
            <p className="text-sm text-blue-600">{t('instructions')}</p>
            <p className="text-xs text-blue-500 mt-1">{t('dataSharing')}</p>
          </div>
        </div>
      </div>

      {/* Current Vitals */}
      {currentVitals && (
        <div className="mb-6">
          <h4 className="font-medium mb-3">{t('currentVitals')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <div className="bg-white/50 p-3 rounded-lg border border-white/20">
              <div className="text-center">
                <div className="text-xl mb-1">💓</div>
                <p className="text-xs text-gray-600">{t('heartRate')}</p>
                <p className={`font-bold ${getVitalColor(getVitalStatus('heartRate', currentVitals.heartRate))}`}>
                  {currentVitals.heartRate} {t('bpm')}
                </p>
              </div>
            </div>
            
            <div className="bg-white/50 p-3 rounded-lg border border-white/20">
              <div className="text-center">
                <div className="text-xl mb-1">🩺</div>
                <p className="text-xs text-gray-600">{t('bloodPressure')}</p>
                <p className="font-bold text-blue-600">
                  {currentVitals.bloodPressure.systolic}/{currentVitals.bloodPressure.diastolic}
                </p>
                <p className="text-xs text-gray-500">{t('mmhg')}</p>
              </div>
            </div>

            <div className="bg-white/50 p-3 rounded-lg border border-white/20">
              <div className="text-center">
                <div className="text-xl mb-1">🌡️</div>
                <p className="text-xs text-gray-600">{t('temperature')}</p>
                <p className={`font-bold ${getVitalColor(getVitalStatus('temperature', currentVitals.temperature))}`}>
                  {currentVitals.temperature}{t('fahrenheit')}
                </p>
              </div>
            </div>

            <div className="bg-white/50 p-3 rounded-lg border border-white/20">
              <div className="text-center">
                <div className="text-xl mb-1">🫁</div>
                <p className="text-xs text-gray-600">{t('oxygenSaturation')}</p>
                <p className={`font-bold ${getVitalColor(getVitalStatus('oxygenSaturation', currentVitals.oxygenSaturation))}`}>
                  {currentVitals.oxygenSaturation}{t('percent')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Devices */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">{t('devices')}</h4>
        {devices.length === 0 ? (
          <div className="text-center py-6 bg-white/30 rounded-lg">
            <div className="text-2xl mb-2">📱</div>
            <p className="text-gray-600 text-sm">{t('noDevices')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <div key={device.id} className="bg-white/50 p-3 rounded-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="text-2xl">{getDeviceIcon(device.type)}</div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium truncate">{device.name}</h5>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                          device.isConnected 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {device.isConnected ? t('connected') : t('disconnected')}
                        </span>
                        <span className={`${device.batteryLevel < 20 ? 'text-red-600' : 'text-gray-600'}`}>
                          🔋 {device.batteryLevel}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('lastReading')}: {formatTime(device.lastSync)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSyncDevice(device.id)}
                    disabled={!device.isConnected || isRecording}
                    className={`px-3 py-1 rounded text-xs transition-all ${
                      device.isConnected && !isRecording
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {isRecording ? 'Syncing...' : t('syncNow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Readings */}
      <div>
        <h4 className="font-medium mb-3">{t('readings')}</h4>
        {readings.length === 0 ? (
          <div className="text-center py-6 bg-white/30 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-gray-600 text-sm">{t('noReadings')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {readings.slice(0, 3).map((reading) => (
              <div key={reading.id} className="bg-white/50 p-3 rounded-lg border border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">{formatTime(reading.timestamp)}</span>
                      <span className="text-xs text-gray-500">{reading.deviceUsed}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">HR: </span>
                        <span className="font-medium">{reading.vitals.heartRate} bpm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">BP: </span>
                        <span className="font-medium">
                          {reading.vitals.bloodPressure.systolic}/{reading.vitals.bloodPressure.diastolic}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Temp: </span>
                        <span className="font-medium">{reading.vitals.temperature}°F</span>
                      </div>
                      <div>
                        <span className="text-gray-500">SpO2: </span>
                        <span className="font-medium">{reading.vitals.oxygenSaturation}%</span>
                      </div>
                    </div>
                    {reading.alerts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-orange-600 font-medium">{t('alerts')}:</p>
                        {reading.alerts.map((alert, index) => (
                          <p key={index} className="text-xs text-orange-600">• {alert}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-all ml-2">
                    {t('shareWithDoctor')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis Banner */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🤖</div>
          <div className="flex-1">
            <h4 className="font-medium text-purple-800">{t('aiAnalysis')}</h4>
            <p className="text-sm text-purple-600">AI-powered insights based on your vital trends and patterns</p>
          </div>
          <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-all">
            View Analysis
          </button>
        </div>
      </div>
    </section>
  );
}
