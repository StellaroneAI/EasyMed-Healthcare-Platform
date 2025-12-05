import React, { useState } from 'react';

interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
  consultationType: 'video' | 'chat' | 'both';
  availableDoctors: number;
  averageWaitTime: string;
  isPrivacySensitive?: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialtyId: string;
  experience: string;
  rating: number;
  available: boolean;
  nextSlot: string;
  language: string[];
}

interface ConsultationBookingProps {
  onBookConsultation?: (booking: any) => void;
  className?: string;
}

export default function ConsultationBooking({ onBookConsultation, className = '' }: ConsultationBookingProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'video' | 'chat'>('video');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [step, setStep] = useState<'specialty' | 'type' | 'doctor' | 'time' | 'confirm'>('specialty');

  const specialties: Specialty[] = [
    {
      id: 'general',
      name: 'General Medicine',
      icon: '🩺',
      description: 'General health concerns, routine checkups',
      consultationType: 'both',
      availableDoctors: 12,
      averageWaitTime: '5-10 mins'
    },
    {
      id: 'gynecology',
      name: 'Gynecology',
      icon: '🤱',
      description: 'Women\'s health, pregnancy care',
      consultationType: 'both',
      availableDoctors: 8,
      averageWaitTime: '10-15 mins',
      isPrivacySensitive: true
    },
    {
      id: 'sexology',
      name: 'Sexual Health',
      icon: '💕',
      description: 'Sexual health concerns, reproductive issues',
      consultationType: 'both',
      availableDoctors: 5,
      averageWaitTime: '15-20 mins',
      isPrivacySensitive: true
    },
    {
      id: 'psychiatry',
      name: 'Mental Health',
      icon: '🧠',
      description: 'Mental health, counseling, therapy',
      consultationType: 'both',
      availableDoctors: 6,
      averageWaitTime: '20-30 mins',
      isPrivacySensitive: true
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      icon: '🧴',
      description: 'Skin conditions, hair, nail problems',
      consultationType: 'both',
      availableDoctors: 4,
      averageWaitTime: '15-25 mins'
    },
    {
      id: 'pediatrics',
      name: 'Pediatrics',
      icon: '👶',
      description: 'Child health, infant care',
      consultationType: 'both',
      availableDoctors: 7,
      averageWaitTime: '10-15 mins'
    },
    {
      id: 'cardiology',
      name: 'Cardiology',
      icon: '❤️',
      description: 'Heart conditions, blood pressure',
      consultationType: 'both',
      availableDoctors: 3,
      averageWaitTime: '25-35 mins'
    },
    {
      id: 'orthopedics',
      name: 'Orthopedics',
      icon: '🦴',
      description: 'Bone, joint, muscle problems',
      consultationType: 'both',
      availableDoctors: 5,
      averageWaitTime: '20-30 mins'
    }
  ];

  const doctors: Doctor[] = [
    {
      id: 'dr1',
      name: 'Dr. Priya Sharma',
      specialtyId: 'gynecology',
      experience: '12 years',
      rating: 4.8,
      available: true,
      nextSlot: '10:30 AM',
      language: ['English', 'Hindi', 'Tamil']
    },
    {
      id: 'dr2',
      name: 'Dr. Rajesh Kumar',
      specialtyId: 'general',
      experience: '8 years',
      rating: 4.6,
      available: true,
      nextSlot: '11:00 AM',
      language: ['English', 'Hindi', 'Telugu']
    },
    {
      id: 'dr3',
      name: 'Dr. Meera Reddy',
      specialtyId: 'sexology',
      experience: '15 years',
      rating: 4.9,
      available: true,
      nextSlot: '2:00 PM',
      language: ['English', 'Telugu', 'Kannada']
    }
  ];

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM'
  ];

  const selectedSpecialtyData = specialties.find(s => s.id === selectedSpecialty);
  const availableDoctors = doctors.filter(d => d.specialtyId === selectedSpecialty && d.available);

  const handleBooking = () => {
    const booking = {
      specialty: selectedSpecialtyData,
      consultationType,
      doctor: doctors.find(d => d.id === selectedDoctor),
      timeSlot: selectedTimeSlot,
      bookingId: 'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'confirmed'
    };
    
    if (onBookConsultation) {
      onBookConsultation(booking);
    }
    
    // Reset form
    setStep('specialty');
    setSelectedSpecialty('');
    setSelectedDoctor('');
    setSelectedTimeSlot('');
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-3">👨‍⚕️</span>
          Multi-Specialty Consultation
        </h2>
        <p className="text-gray-600 mt-1">Choose video or chat consultation based on your comfort</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {['specialty', 'type', 'doctor', 'time', 'confirm'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName ? 'bg-blue-600 text-white' : 
                ['specialty', 'type', 'doctor', 'time', 'confirm'].indexOf(step) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  ['specialty', 'type', 'doctor', 'time', 'confirm'].indexOf(step) > index ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 font-medium">
          {step === 'specialty' && 'Select Medical Specialty'}
          {step === 'type' && 'Choose Consultation Type'}
          {step === 'doctor' && 'Select Doctor'}
          {step === 'time' && 'Pick Time Slot'}
          {step === 'confirm' && 'Confirm Booking'}
        </div>
      </div>

      {/* Step 1: Select Specialty */}
      {step === 'specialty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => {
                setSelectedSpecialty(specialty.id);
                setStep('type');
              }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">{specialty.icon}</span>
                </div>
                {specialty.isPrivacySensitive && (
                  <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    🔒 Private
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{specialty.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{specialty.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{specialty.availableDoctors} doctors</span>
                <span>{specialty.averageWaitTime}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Select Consultation Type */}
      {step === 'type' && selectedSpecialtyData && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {selectedSpecialtyData.name} Consultation
            </h3>
            <p className="text-gray-600">Choose your preferred consultation method</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => {
                setConsultationType('video');
                setStep('doctor');
              }}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl">📹</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Video Consultation</h4>
                <p className="text-sm text-gray-600 mb-4">Face-to-face consultation with doctor</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>✓ Personal interaction</div>
                  <div>✓ Visual examination</div>
                  <div>✓ Real-time diagnosis</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setConsultationType('chat');
                setStep('doctor');
              }}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-3xl">💬</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Chat Consultation</h4>
                <p className="text-sm text-gray-600 mb-4">Text-based private consultation</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>✓ Complete privacy</div>
                  <div>✓ Written records</div>
                  <div>✓ Comfortable for sensitive topics</div>
                  {selectedSpecialtyData.isPrivacySensitive && (
                    <div className="text-purple-600">✓ Recommended for sensitive consultations</div>
                  )}
                </div>
              </div>
            </button>
          </div>

          {selectedSpecialtyData.isPrivacySensitive && (
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-purple-600 text-lg mr-2">🔒</span>
                <div>
                  <h5 className="font-medium text-purple-800">Privacy Notice</h5>
                  <p className="text-sm text-purple-700">
                    This specialty involves sensitive topics. Chat consultation provides complete privacy 
                    and may be more comfortable for discussing personal health matters.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Doctor */}
      {step === 'doctor' && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setStep('type')}
              className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
            >
              ← Back to consultation type
            </button>
            <h3 className="text-xl font-semibold text-gray-800">
              Available Doctors for {consultationType === 'video' ? 'Video' : 'Chat'} Consultation
            </h3>
          </div>

          <div className="grid gap-4">
            {availableDoctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => {
                  setSelectedDoctor(doctor.id);
                  setStep('time');
                }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl">👨‍⚕️</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">{doctor.name}</h4>
                        <p className="text-gray-600">{selectedSpecialtyData?.name} Specialist</p>
                        <p className="text-sm text-gray-500">{doctor.experience} experience</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm font-medium ml-1">{doctor.rating}</span>
                        </div>
                        <div className="text-sm text-gray-500">Next slot: {doctor.nextSlot}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {doctor.language.map((lang) => (
                        <span key={lang} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Select Time */}
      {step === 'time' && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setStep('doctor')}
              className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
            >
              ← Back to doctor selection
            </button>
            <h3 className="text-xl font-semibold text-gray-800">Select Time Slot</h3>
            <p className="text-gray-600">Available slots for today</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  setSelectedTimeSlot(slot);
                  setStep('confirm');
                }}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow border border-white/20 hover:shadow-lg transition-all duration-300 hover:scale-105 text-center"
              >
                <div className="text-sm font-medium text-gray-800">{slot}</div>
                <div className="text-xs text-green-600">Available</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Confirm Booking */}
      {step === 'confirm' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Confirm Your Booking</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Specialty:</span>
                <span className="font-medium">{selectedSpecialtyData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Type:</span>
                <span className="font-medium flex items-center">
                  {consultationType === 'video' ? '📹 Video Call' : '💬 Chat'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{doctors.find(d => d.id === selectedDoctor)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTimeSlot}</span>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => setStep('time')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg transition-all duration-300"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
