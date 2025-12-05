import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  taken: { [date: string]: boolean[] };
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  instructions: string;
  sideEffects: string[];
  interactions: string[];
}

interface DrugInteraction {
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  medications: string[];
  recommendation: string;
}

interface Reminder {
  id: string;
  medicationId: string;
  time: string;
  taken: boolean;
  skipped: boolean;
  timestamp: Date;
}

export default function MedicationManager() {
  const { currentLanguage, getText } = useLanguage();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [activeTab, setActiveTab] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const [adherenceScore, setAdherenceScore] = useState(0);

  useEffect(() => {
    loadMedicationData();
    generateTodayReminders();
    checkDrugInteractions();
  }, []);

  const loadMedicationData = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockMedications: Medication[] = [
      {
        id: 'med1',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        times: ['08:00', '20:00'],
        taken: generateMedicationHistory(),
        startDate: '2025-01-01',
        prescribedBy: 'Dr. Smith',
        instructions: 'Take with food to reduce stomach upset',
        sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
        interactions: ['Alcohol', 'Contrast dye']
      },
      {
        id: 'med2',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        times: ['08:00'],
        taken: generateMedicationHistory(),
        startDate: '2025-01-15',
        prescribedBy: 'Dr. Johnson',
        instructions: 'Take at the same time each day',
        sideEffects: ['Dry cough', 'Dizziness', 'Fatigue'],
        interactions: ['NSAIDs', 'Potassium supplements']
      },
      {
        id: 'med3',
        name: 'Vitamin D3',
        dosage: '2000 IU',
        frequency: 'Once daily',
        times: ['09:00'],
        taken: generateMedicationHistory(),
        startDate: '2025-02-01',
        prescribedBy: 'Dr. Wilson',
        instructions: 'Take with fat-containing meal for better absorption',
        sideEffects: ['Constipation (rare)', 'Kidney stones (with high doses)'],
        interactions: ['Thiazide diuretics']
      },
      {
        id: 'med4',
        name: 'Omega-3',
        dosage: '1000mg',
        frequency: 'Once daily',
        times: ['19:00'],
        taken: generateMedicationHistory(),
        startDate: '2025-01-10',
        prescribedBy: 'Dr. Brown',
        instructions: 'Take with evening meal',
        sideEffects: ['Fishy aftertaste', 'Stomach upset'],
        interactions: ['Blood thinners']
      }
    ];

    setMedications(mockMedications);
    calculateAdherenceScore(mockMedications);
    setIsLoading(false);
  };

  const generateMedicationHistory = () => {
    const history: { [date: string]: boolean[] } = {};
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      // Simulate 85% adherence rate
      history[dateStr] = [Math.random() > 0.15, Math.random() > 0.15];
    }
    return history;
  };

  const generateTodayReminders = () => {
    const today = new Date().toISOString().split('T')[0];
    const reminders: Reminder[] = [];
    
    medications.forEach(med => {
      med.times.forEach((time, index) => {
        const [hours, minutes] = time.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        reminders.push({
          id: `${med.id}-${index}`,
          medicationId: med.id,
          time: time,
          taken: med.taken[today]?.[index] || false,
          skipped: false,
          timestamp: reminderTime
        });
      });
    });

    setTodayReminders(reminders.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()));
  };

  const checkDrugInteractions = () => {
    const drugInteractions: DrugInteraction[] = [
      {
        severity: 'moderate',
        description: 'Metformin and alcohol can increase risk of lactic acidosis',
        medications: ['Metformin', 'Alcohol'],
        recommendation: 'Limit alcohol consumption while taking Metformin'
      },
      {
        severity: 'mild',
        description: 'Omega-3 may enhance the effects of blood thinners',
        medications: ['Omega-3', 'Blood thinners'],
        recommendation: 'Monitor for increased bleeding risk, consult doctor if taking anticoagulants'
      }
    ];

    setInteractions(drugInteractions);
  };

  const calculateAdherenceScore = (meds: Medication[]) => {
    let totalDoses = 0;
    let takenDoses = 0;

    meds.forEach(med => {
      Object.values(med.taken).forEach(dailyDoses => {
        totalDoses += dailyDoses.length;
        takenDoses += dailyDoses.filter(taken => taken).length;
      });
    });

    const score = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    setAdherenceScore(score);
  };

  const markMedicationTaken = (reminderId: string, taken: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const reminder = todayReminders.find(r => r.id === reminderId);
    
    if (reminder) {
      // Update reminder
      setTodayReminders(prev => 
        prev.map(r => r.id === reminderId ? { ...r, taken, skipped: !taken } : r)
      );

      // Update medication history
      const timeIndex = medications
        .find(m => m.id === reminder.medicationId)
        ?.times.indexOf(reminder.time) || 0;

      setMedications(prev => 
        prev.map(med => {
          if (med.id === reminder.medicationId) {
            const updatedTaken = { ...med.taken };
            if (!updatedTaken[today]) {
              updatedTaken[today] = new Array(med.times.length).fill(false);
            }
            updatedTaken[today][timeIndex] = taken;
            return { ...med, taken: updatedTaken };
          }
          return med;
        })
      );
    }

    // Recalculate adherence
    setTimeout(() => calculateAdherenceScore(medications), 100);
  };

  const getAdherenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'border-yellow-400 bg-yellow-50';
      case 'moderate': return 'border-orange-400 bg-orange-50';
      case 'severe': return 'border-red-400 bg-red-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const speakReminder = (medication: Medication, time: string) => {
    if ('speechSynthesis' in window) {
      const text = `Time to take your ${medication.name}, ${medication.dosage}. ${medication.instructions}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Medication Manager</h2>
          <p className="text-gray-500">Preparing your medication schedule and checking for interactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Adherence Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">💊 Smart Medication Manager</h1>
            <p className="text-blue-100">AI-powered medication tracking and interaction checking</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{adherenceScore}%</div>
            <div className="text-blue-100 text-sm">Adherence Score</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getAdherenceColor(adherenceScore).replace('text-', 'text-').replace('bg-', 'bg-opacity-20 bg-')}`}>
              {adherenceScore >= 90 ? '🟢 Excellent' : adherenceScore >= 70 ? '🟡 Good' : '🔴 Needs Improvement'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className="flex space-x-1">
          {[
            { id: 'today', name: 'Today', icon: '📅' },
            { id: 'medications', name: 'All Medications', icon: '💊' },
            { id: 'interactions', name: 'Drug Interactions', icon: '⚠️' },
            { id: 'history', name: 'History', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Medications Tab */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🕐 Today's Medication Schedule</h2>
            <div className="space-y-3">
              {todayReminders.map((reminder) => {
                const medication = medications.find(m => m.id === reminder.medicationId);
                if (!medication) return null;

                const now = new Date();
                const reminderTime = reminder.timestamp;
                const isPast = now > reminderTime;
                const isUpcoming = Math.abs(now.getTime() - reminderTime.getTime()) < 30 * 60 * 1000; // 30 minutes

                return (
                  <div
                    key={reminder.id}
                    className={`p-4 rounded-lg border-2 ${
                      reminder.taken 
                        ? 'border-green-400 bg-green-50' 
                        : reminder.skipped
                          ? 'border-red-400 bg-red-50'
                          : isPast
                            ? 'border-yellow-400 bg-yellow-50'
                            : isUpcoming
                              ? 'border-blue-400 bg-blue-50 animate-pulse'
                              : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{reminder.time}</div>
                          <div className="text-xs text-gray-600">
                            {isPast ? 'Past due' : isUpcoming ? 'Upcoming' : 'Scheduled'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{medication.name}</h3>
                          <p className="text-gray-600">{medication.dosage} - {medication.frequency}</p>
                          <p className="text-sm text-gray-500">{medication.instructions}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isUpcoming && (
                          <button
                            onClick={() => speakReminder(medication, reminder.time)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            title="Play reminder"
                          >
                            🔊
                          </button>
                        )}
                        
                        {!reminder.taken && !reminder.skipped && (
                          <>
                            <button
                              onClick={() => markMedicationTaken(reminder.id, true)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              ✅ Taken
                            </button>
                            <button
                              onClick={() => markMedicationTaken(reminder.id, false)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              ❌ Skip
                            </button>
                          </>
                        )}
                        
                        {reminder.taken && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <span>✅</span>
                            <span className="font-medium">Taken</span>
                          </div>
                        )}
                        
                        {reminder.skipped && (
                          <div className="flex items-center space-x-2 text-red-600">
                            <span>❌</span>
                            <span className="font-medium">Skipped</span>
                            <button
                              onClick={() => markMedicationTaken(reminder.id, true)}
                              className="text-sm underline"
                            >
                              Mark as taken
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {todayReminders.filter(r => r.taken).length}
              </div>
              <div className="text-gray-600">Medications Taken Today</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {todayReminders.length}
              </div>
              <div className="text-gray-600">Total Doses Today</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {medications.length}
              </div>
              <div className="text-gray-600">Active Medications</div>
            </div>
          </div>
        </div>
      )}

      {/* All Medications Tab */}
      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {medications.map((medication) => (
              <div key={medication.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{medication.name}</h3>
                  <span className="text-sm text-gray-500">
                    Prescribed by {medication.prescribedBy}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dosage:</span>
                    <span className="font-medium">{medication.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="font-medium">{medication.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Times:</span>
                    <span className="font-medium">{medication.times.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{new Date(medication.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{medication.instructions}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Common Side Effects:</h4>
                  <div className="flex flex-wrap gap-1">
                    {medication.sideEffects.map((effect, index) => (
                      <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Full Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drug Interactions Tab */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">⚠️ Drug Interaction Checker</h2>
            
            {interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${getSeverityColor(interaction.severity)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg">
                        {interaction.severity === 'severe' ? '🚨' : interaction.severity === 'moderate' ? '⚠️' : '💡'} 
                        {' '}{interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)} Interaction
                      </h3>
                      <span className="text-sm text-gray-600">
                        {interaction.medications.join(' + ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{interaction.description}</p>
                    
                    <div className="bg-white p-3 rounded border-l-4 border-blue-400">
                      <h4 className="font-medium text-blue-800 mb-1">Recommendation:</h4>
                      <p className="text-blue-700 text-sm">{interaction.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">✅</span>
                <h3 className="text-lg font-semibold text-green-600 mb-2">No Drug Interactions Found</h3>
                <p className="text-gray-600">Your current medications appear to be safe to take together.</p>
              </div>
            )}

            {/* Add New Medication Check */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Add New Medication</h3>
              <p className="text-blue-700 text-sm mb-3">Check for interactions before starting a new medication</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter medication name..."
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Check Interactions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">📊 Medication Adherence History</h2>
            
            {/* Adherence Chart */}
            <div className="mb-6">
              <h3 className="font-medium mb-3">Last 30 Days Adherence</h3>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs text-gray-500 p-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (29 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  
                  // Calculate adherence for this day
                  let totalDoses = 0;
                  let takenDoses = 0;
                  
                  medications.forEach(med => {
                    if (med.taken[dateStr]) {
                      totalDoses += med.taken[dateStr].length;
                      takenDoses += med.taken[dateStr].filter(taken => taken).length;
                    }
                  });
                  
                  const adherence = totalDoses > 0 ? takenDoses / totalDoses : 0;
                  
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded text-xs flex items-center justify-center font-medium ${
                        adherence === 1 ? 'bg-green-500 text-white' :
                        adherence >= 0.7 ? 'bg-yellow-500 text-white' :
                        adherence > 0 ? 'bg-red-500 text-white' : 'bg-gray-200'
                      }`}
                      title={`${date.toLocaleDateString()}: ${Math.round(adherence * 100)}% adherence`}
                    >
                      {Math.round(adherence * 100)}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>100% adherence</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>70-99% adherence</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Below 70% adherence</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  <span>No medications</span>
                </div>
              </div>
            </div>

            {/* Individual Medication History */}
            <div className="space-y-4">
              <h3 className="font-medium">Individual Medication Adherence</h3>
              {medications.map(medication => {
                const totalDoses = Object.values(medication.taken).reduce((sum, daily) => sum + daily.length, 0);
                const takenDoses = Object.values(medication.taken).reduce((sum, daily) => sum + daily.filter(taken => taken).length, 0);
                const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
                
                return (
                  <div key={medication.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{medication.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAdherenceColor(adherencePercent)}`}>
                        {adherencePercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          adherencePercent >= 90 ? 'bg-green-500' :
                          adherencePercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${adherencePercent}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {takenDoses} of {totalDoses} doses taken
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
