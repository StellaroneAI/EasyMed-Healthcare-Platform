import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { authService, AuthResult } from '../services/realAuthService';

interface LoginPageProps {
  onLogin: (userType: 'patient' | 'asha' | 'doctor' | 'admin', userInfo: any) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { currentLanguage } = useLanguage();
  const { loginAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<'patient' | 'asha' | 'doctor' | 'admin'>('patient');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email' | 'social'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Text-to-speech function
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMap: { [key: string]: string } = {
        english: 'en-US',
        hindi: 'hi-IN',
        tamil: 'ta-IN',
        telugu: 'te-IN',
        bengali: 'bn-IN',
        marathi: 'mr-IN',
        punjabi: 'pa-IN',
        gujarati: 'gu-IN',
        kannada: 'kn-IN',
        malayalam: 'ml-IN',
        odia: 'or-IN',
        assamese: 'as-IN'
      };
      
      utterance.lang = langMap[currentLanguage] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-read messages when they change
  useEffect(() => {
    if (message) {
      speakMessage(message);
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, currentLanguage]);

  // Success messages in multiple languages
  const successMessages = {
    english: 'Login successful! Welcome to EasyMed.',
    hindi: 'लॉगिन सफल! EasyMed में आपका स्वागत है।',
    tamil: 'உள்நுழைவு வெற்றிகரமானது! EasyMed இல் உங்களை வரவேற்கிறோம்।',
    telugu: 'లాగిన్ విజయవంతమైంది! EasyMed కు స్వాగతం.',
    bengali: 'লগইন সফল! EasyMed এ আপনাকে স্বাগতম।',
    marathi: 'लॉगिन यशस्वी! EasyMed मध्ये आपले स्वागत आहे.',
    punjabi: 'ਲਾਗਇਨ ਸਫਲ! EasyMed ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।',
    gujarati: 'લોગિન સફળ! EasyMed માં તમારું સ્વાગત છે.',
    kannada: 'ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ! EasyMed ಗೆ ನಿಮಗೆ ಸ್ವಾಗತ.',
    malayalam: 'ലോഗിൻ വിജയകരമായി! EasyMed ലേക്ക് സ്വാഗതം.',
    odia: 'ଲଗଇନ୍ ସଫଳ! EasyMed କୁ ସ୍ୱାଗତ।',
    assamese: 'লগইন সফল! EasyMed লৈ আপোনাক স্বাগতম।'
  };

  const loginTexts = {
    english: {
      welcome: "Welcome to EasyMed",
      tagline: "Your Family's Health, Just a Tap Away",
      patient: "Patient/Family",
      asha: "ASHA Worker",
      doctor: "Doctor/Healthcare Provider",
      admin: "Admin/NGO",
      phoneLogin: "Login with Phone",
      emailLogin: "Login with Email",
      socialLogin: "Social Login",
      phoneNumber: "Phone Number",
      email: "Email Address",
      password: "Password",
      enterOtp: "Enter OTP",
      sendOtp: "Send OTP",
      verifyOtp: "Verify OTP",
      login: "Login",
      continueWith: "Or continue with",
      dontHaveAccount: "Don't have an account?",
      signUp: "Sign Up",
      terms: "By continuing, you agree to our Terms and Privacy Policy",
      patientDesc: "Access your health records, book appointments, and manage family health",
      ashaDesc: "Manage community health programs and patient outreach",
      doctorDesc: "Manage patients, appointments, and medical consultations",
      adminDesc: "Oversee health programs and manage system data"
    },
    hindi: {
      welcome: "EasyMed में आपका स्वागत है",
      tagline: "आपके परिवार का स्वास्थ्य, एक स्पर्श की दूरी पर",
      patient: "मरीज़/परिवार",
      asha: "आशा कार्यकर्ता",
      doctor: "डॉक्टर/स्वास्थ्य प्रदाता",
      admin: "प्रशासक/एनजीओ",
      phoneLogin: "फोन से लॉगिन करें",
      emailLogin: "ईमेल से लॉगिन करें",
      socialLogin: "सामाजिक लॉगिन",
      phoneNumber: "फोन नंबर",
      email: "ईमेल पता",
      password: "पासवर्ड",
      enterOtp: "OTP दर्ज करें",
      sendOtp: "OTP भेजें",
      verifyOtp: "OTP सत्यापित करें",
      login: "लॉगिन",
      continueWith: "या जारी रखें",
      dontHaveAccount: "खाता नहीं है?",
      signUp: "साइन अप करें",
      terms: "जारी रखकर, आप हमारी शर्तों और गोपनीयता नीति से सहमत हैं",
      patientDesc: "अपने स्वास्थ्य रिकॉर्ड तक पहुंचें, अपॉइंटमेंट बुक करें और पारिवारिक स्वास्थ्य प्रबंधित करें",
      ashaDesc: "सामुदायिक स्वास्थ्य कार्यक्रमों और रोगी आउटरीच का प्रबंधन करें",
      doctorDesc: "रोगियों, अपॉइंटमेंट्स और चिकित्सा परामर्श का प्रबंधन करें",
      adminDesc: "स्वास्थ्य कार्यक्रमों की देखरेख करें और सिस्टम डेटा प्रबंधित करें"
    },
    tamil: {
      welcome: "EasyMed இல் உங்களை வரவேற்கிறோம்",
      tagline: "உங்கள் குடும்பத்தின் ஆரோக்கியம், ஒரு தட்டல் தூரத்தில்",
      patient: "நோயாளி/குடும்பம்",
      asha: "ஆஷா பணியாளர்",
      doctor: "மருத்துவர்/சுகாதார வழங்குநர்",
      admin: "நிர்வாகி/என்ஜிஓ",
      phoneLogin: "தொலைபேசியில் உள்நுழைக",
      emailLogin: "மின்னஞ்சலில் உள்நுழைக",
      socialLogin: "சமூக உள்நுழைவு",
      phoneNumber: "தொலைபேசி எண்",
      email: "மின்னஞ்சல் முகவரி",
      password: "கடவுச்சொல்",
      enterOtp: "OTP ஐ உள்ளிடவும்",
      sendOtp: "OTP அனுப்பு",
      verifyOtp: "OTP சரிபார்க்கவும்",
      login: "உள்நுழைக",
      continueWith: "அல்லது தொடரவும்",
      dontHaveAccount: "கணக்கு இல்லையா?",
      signUp: "பதிவு செய்யவும்",
      terms: "தொடர்வதன் மூலம், எங்கள் விதிமுறைகள் மற்றும் தனியுரிமைக் கொள்கையை ஒப்புக்கொள்கிறீர்கள்",
      patientDesc: "உங்கள் சுகாதார பதிவுகளை அணுகவும், நியமனங்களை முன்பதிவு செய்யவும் மற்றும் குடும்ப சுகாதாரத்தை நிர்வகிக்கவும்",
      ashaDesc: "சமூக சுகாதார திட்டங்கள் மற்றும் நோயாளி வெளியீட்டை நிர்வகிக்கவும்",
      doctorDesc: "நோயாளிகள், நியமனங்கள் மற்றும் மருத்துவ ஆலோசனைகளை நிர்வகிக்கவும்",
      adminDesc: "சுகாதார திட்டங்களை மேற்பார்வையிடுங்கள் மற்றும் கணினி தரவை நிர்வகிக்கவும்"
    }
  };

  const getText = (key: keyof typeof loginTexts.english): string => {
    return loginTexts[currentLanguage as keyof typeof loginTexts]?.[key] || loginTexts.english[key];
  };

  const userTypes = [
    {
      id: 'patient' as const,
      icon: '👨‍👩‍👧‍👦',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'asha' as const,
      icon: '🏥',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'doctor' as const,
      icon: '👨‍⚕️',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'admin' as const,
      icon: '⚙️',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    }
  ];

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      setMessage('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      let result: AuthResult;
      
      if (activeTab === 'admin') {
        result = await authService.authenticateAdmin(phoneNumber);
      } else {
        result = await authService.sendOTP(phoneNumber);
      }
      
      if (result.success && result.otpSent) {
        setShowOTP(true);
        setMessage(`OTP sent to ${phoneNumber}. Please check your SMS.`);
      } else {
        setMessage(result.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setMessage('Please enter 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyOTPAndLogin(phoneNumber, otp, activeTab);
      
      if (result.success && result.user) {
        const successMsg = successMessages[currentLanguage as keyof typeof successMessages] || successMessages.english;
        setMessage(successMsg);
        
        setTimeout(() => {
          onLogin(result.user!.userType, {
            id: result.user!.id,
            name: result.user!.name,
            email: result.user!.email,
            phone: result.user!.phone,
            userType: result.user!.userType,
            abhaProfile: result.user!.abhaProfile,
            specialty: result.user!.specialty,
            village: result.user!.village,
            organization: result.user!.organization
          });
        }, 1000);
      } else {
        setMessage(result.error || 'OTP verification failed');
      }
    } catch (error: any) {
      setMessage(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      if (activeTab === 'admin') {
        if (loginMethod === 'email' && email && password) {
          const result = await authService.authenticateAdmin(email, password);
          
          if (result.success && result.user) {
            try {
              await loginAdmin(email, {
                name: result.user.name,
                email: result.user.email,
                phone: result.user.phone
              }, password);
            } catch (adminError) {
              console.log('AdminContext login failed, but proceeding with main login');
            }
            
            const successMsg = successMessages[currentLanguage as keyof typeof successMessages] || successMessages.english;
            setMessage(successMsg);
            
            setTimeout(() => {
              onLogin('admin', {
                id: result.user!.id,
                name: result.user!.name,
                email: result.user!.email,
                phone: result.user!.phone,
                userType: 'admin',
                organization: result.user!.organization
              });
            }, 1000);
          } else {
            setMessage(result.error || 'Admin authentication failed');
          }
        } else {
          setMessage('Please enter email and password for admin login');
        }
      } else {
        if (loginMethod === 'phone') {
          if (!showOTP) {
            setMessage('Please send OTP first');
            return;
          }
          await handleVerifyOTP();
        } else if (loginMethod === 'email' && email && password) {
          setMessage('Email login not available yet. Please use phone login with OTP verification.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setMessage(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (showOTP) {
        handleVerifyOTP();
      } else if (loginMethod === 'phone' && phoneNumber) {
        handleSendOTP();
      } else if (loginMethod === 'email' && email && password) {
        handleLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Message display */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg z-50 max-w-md text-center">
          {message}
        </div>
      )}

      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg">
          {/* Header */}
          <div className="text-center p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="text-5xl mb-4">🏥</div>
            <h1 className="text-3xl font-bold mb-2">{getText('welcome')}</h1>
            <p className="text-blue-100">{getText('tagline')}</p>
          </div>

          {/* User Type Selection */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {userTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    activeTab === type.id
                      ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg`
                      : `${type.borderColor} hover:${type.bgColor} bg-white`
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{getText(type.id)}</div>
                </button>
              ))}
            </div>

            {/* Login Method Tabs */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                onClick={() => setLoginMethod('phone')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'phone'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                📱 {getText('phoneLogin')}
              </button>
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                📧 {getText('emailLogin')}
              </button>
            </div>

            {/* Phone Login */}
            {loginMethod === 'phone' && (
              <div className="space-y-4">
                <div>
                  <input
                    type="tel"
                    placeholder={getText('phoneNumber')}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                {showOTP && (
                  <div>
                    <input
                      type="text"
                      placeholder={getText('enterOtp')}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                      maxLength={6}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <button
                  onClick={showOTP ? handleVerifyOTP : handleSendOTP}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : showOTP ? (
                    getText('verifyOtp')
                  ) : (
                    getText('sendOtp')
                  )}
                </button>
              </div>
            )}

            {/* Email Login */}
            {loginMethod === 'email' && (
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder={getText('email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <input
                  type="password"
                  placeholder={getText('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleLogin}
                  disabled={isLoading || !email || !password}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </div>
                  ) : (
                    getText('login')
                  )}
                </button>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-gray-600 text-center mt-6">
              {getText('terms')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}