import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  bodyPart: string;
  duration: string;
}

interface DiagnosisResult {
  condition: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  urgency: 'routine' | 'urgent' | 'emergency';
  specialist: string;
}

export default function SymptomChecker() {
  const { currentLanguage, getText } = useLanguage();
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    existingConditions: [] as string[],
    medications: [] as string[]
  });

  const commonSymptoms = [
    { id: 'fever', name: 'Fever', severity: 'moderate' as const, bodyPart: 'general', duration: '' },
    { id: 'headache', name: 'Headache', severity: 'mild' as const, bodyPart: 'head', duration: '' },
    { id: 'chest_pain', name: 'Chest Pain', severity: 'severe' as const, bodyPart: 'chest', duration: '' },
    { id: 'cough', name: 'Cough', severity: 'mild' as const, bodyPart: 'respiratory', duration: '' },
    { id: 'fatigue', name: 'Fatigue', severity: 'mild' as const, bodyPart: 'general', duration: '' },
    { id: 'nausea', name: 'Nausea', severity: 'moderate' as const, bodyPart: 'stomach', duration: '' },
    { id: 'dizziness', name: 'Dizziness', severity: 'moderate' as const, bodyPart: 'head', duration: '' },
    { id: 'shortness_breath', name: 'Shortness of Breath', severity: 'severe' as const, bodyPart: 'respiratory', duration: '' },
    { id: 'abdominal_pain', name: 'Abdominal Pain', severity: 'moderate' as const, bodyPart: 'stomach', duration: '' },
    { id: 'joint_pain', name: 'Joint Pain', severity: 'mild' as const, bodyPart: 'joints', duration: '' }
  ];

  const existingConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis', 
    'Thyroid Disorder', 'Kidney Disease', 'Liver Disease'
  ];

  const analyzeSymptoms = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis with more sophisticated logic
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Advanced symptom analysis algorithm
    const severityScore = selectedSymptoms.reduce((score, symptom) => {
      const severityWeight = { mild: 1, moderate: 2, severe: 3 };
      return score + severityWeight[symptom.severity];
    }, 0);
    
    const hasEmergencySymptoms = selectedSymptoms.some(s => 
      ['chest_pain', 'shortness_breath'].includes(s.id)
    );
    
    let result: DiagnosisResult;
    
    if (hasEmergencySymptoms) {
      result = {
        condition: 'Potential Cardiac/Respiratory Emergency',
        probability: 85,
        severity: 'high',
        urgency: 'emergency',
        specialist: 'Emergency Medicine / Cardiology',
        recommendations: [
          '🚨 Seek immediate emergency medical attention',
          '📞 Call emergency services (108/102)',
          '🏥 Go to nearest emergency room',
          '💊 Do not take any medication without medical supervision',
          '📍 Have someone accompany you to the hospital'
        ]
      };
    } else if (severityScore >= 6) {
      result = {
        condition: 'Moderate Medical Condition',
        probability: 75,
        severity: 'medium',
        urgency: 'urgent',
        specialist: 'General Medicine',
        recommendations: [
          '⏰ Schedule appointment within 24-48 hours',
          '🌡️ Monitor temperature and vital signs',
          '💧 Stay hydrated and rest',
          '📝 Keep a symptom diary',
          '📞 Contact doctor if symptoms worsen'
        ]
      };
    } else {
      result = {
        condition: 'Mild Condition - Self Care Possible',
        probability: 60,
        severity: 'low',
        urgency: 'routine',
        specialist: 'General Practitioner',
        recommendations: [
          '🏠 Home care and rest recommended',
          '💧 Increase fluid intake',
          '🌡️ Monitor symptoms for 24-48 hours',
          '📱 Schedule routine check-up if persists',
          '🔄 Return if symptoms worsen or new symptoms appear'
        ]
      };
    }
    
    setDiagnosisResult(result);
    setIsAnalyzing(false);
  };

  const addSymptom = (symptom: typeof commonSymptoms[0]) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, { ...symptom, duration: '1-2 days' }]);
    }
  };

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
  };

  const speakDiagnosis = () => {
    if ('speechSynthesis' in window && diagnosisResult) {
      const text = `Analysis complete. Condition: ${diagnosisResult.condition}. Probability: ${diagnosisResult.probability}%. Urgency level: ${diagnosisResult.urgency}. Recommended specialist: ${diagnosisResult.specialist}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">🤖 AI Symptom Checker</h1>
        <p className="text-blue-100">Advanced AI-powered health assessment and recommendations</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep >= step 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 mx-2 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Patient Information */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">👤 Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={patientInfo.age}
                onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Existing Medical Conditions</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {existingConditions.map((condition) => (
                <label key={condition} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={patientInfo.existingConditions.includes(condition)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPatientInfo({
                          ...patientInfo,
                          existingConditions: [...patientInfo.existingConditions, condition]
                        });
                      } else {
                        setPatientInfo({
                          ...patientInfo,
                          existingConditions: patientInfo.existingConditions.filter(c => c !== condition)
                        });
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            disabled={!patientInfo.age || !patientInfo.gender}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Select Symptoms
          </button>
        </div>
      )}

      {/* Step 2: Symptom Selection */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Select Your Symptoms</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {commonSymptoms.map((symptom) => (
              <button
                key={symptom.id}
                onClick={() => addSymptom(symptom)}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  selectedSymptoms.find(s => s.id === symptom.id)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                  symptom.severity === 'mild' ? 'bg-green-500' :
                  symptom.severity === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {symptom.name}
              </button>
            ))}
          </div>

          {/* Selected Symptoms */}
          {selectedSymptoms.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Selected Symptoms ({selectedSymptoms.length})</h3>
              <div className="space-y-2">
                {selectedSymptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        symptom.severity === 'mild' ? 'bg-green-500' :
                        symptom.severity === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{symptom.name}</span>
                      <span className="text-sm text-gray-600">({symptom.severity})</span>
                    </div>
                    <button
                      onClick={() => removeSymptom(symptom.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={selectedSymptoms.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: Duration & Details
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Symptom Details */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⏰ Symptom Duration & Severity</h2>
          
          <div className="space-y-4">
            {selectedSymptoms.map((symptom, index) => (
              <div key={symptom.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-3">{symptom.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select
                      value={symptom.duration}
                      onChange={(e) => {
                        const updated = [...selectedSymptoms];
                        updated[index].duration = e.target.value;
                        setSelectedSymptoms(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="few-hours">Few hours</option>
                      <option value="1-2-days">1-2 days</option>
                      <option value="3-7-days">3-7 days</option>
                      <option value="1-2-weeks">1-2 weeks</option>
                      <option value="more-than-2-weeks">More than 2 weeks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                    <select
                      value={symptom.severity}
                      onChange={(e) => {
                        const updated = [...selectedSymptoms];
                        updated[index].severity = e.target.value as 'mild' | 'moderate' | 'severe';
                        setSelectedSymptoms(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Analyze Symptoms
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Analysis & Results */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔬 AI Analysis & Recommendations</h2>
          
          {!diagnosisResult && !isAnalyzing && (
            <div className="text-center py-8">
              <button
                onClick={analyzeSymptoms}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
              >
                🤖 Start AI Analysis
              </button>
              <p className="text-gray-600 mt-2">Our AI will analyze your symptoms and provide recommendations</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-blue-600">Analyzing your symptoms...</p>
              <p className="text-gray-600 mt-2">Please wait while our AI processes your information</p>
            </div>
          )}

          {diagnosisResult && (
            <div className="space-y-6">
              {/* Urgency Alert */}
              <div className={`p-4 rounded-lg border-l-4 ${
                diagnosisResult.urgency === 'emergency' 
                  ? 'bg-red-50 border-red-500' 
                  : diagnosisResult.urgency === 'urgent'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${
                      diagnosisResult.urgency === 'emergency' ? 'text-red-800' :
                      diagnosisResult.urgency === 'urgent' ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      {diagnosisResult.urgency === 'emergency' ? '🚨 Emergency' :
                       diagnosisResult.urgency === 'urgent' ? '⚠️ Urgent' : '✅ Routine'}
                    </h3>
                    <p className={`text-sm ${
                      diagnosisResult.urgency === 'emergency' ? 'text-red-700' :
                      diagnosisResult.urgency === 'urgent' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {diagnosisResult.urgency === 'emergency' ? 'Immediate medical attention required' :
                       diagnosisResult.urgency === 'urgent' ? 'Schedule appointment soon' : 'Can wait for routine care'}
                    </p>
                  </div>
                  <button
                    onClick={speakDiagnosis}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    title="Listen to diagnosis"
                  >
                    🔊
                  </button>
                </div>
              </div>

              {/* Diagnosis Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg mb-3">📊 Analysis Results</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Likely Condition:</span>
                      <p className="font-medium">{diagnosisResult.condition}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Confidence Level:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${diagnosisResult.probability}%` }}
                          />
                        </div>
                        <span className="font-medium">{diagnosisResult.probability}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Recommended Specialist:</span>
                      <p className="font-medium">{diagnosisResult.specialist}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-lg mb-3">💡 Recommendations</h3>
                  <ul className="space-y-2">
                    {diagnosisResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start space-x-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  📅 Book Appointment
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  📞 Call Doctor
                </button>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  📋 Save Report
                </button>
                <button 
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedSymptoms([]);
                    setDiagnosisResult(null);
                    setPatientInfo({ age: '', gender: '', existingConditions: [], medications: [] });
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  🔄 New Analysis
                </button>
              </div>

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <h4 className="font-semibold mb-2">⚠️ Important Disclaimer</h4>
                <p>This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for proper diagnosis and treatment.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
