import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceAssistantProps {
  userName?: string;
  onCommand?: (command: string, language: string) => void;
}

export default function VoiceAssistant({ userName = "User", onCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const { getVoiceCommand, currentLanguage } = useLanguage();

  // Get current time greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'goodMorning';
    if (hour < 17) return 'goodAfternoon';
    return 'goodEvening';
  };

  // Enhanced speech synthesis with better Tamil support
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langCodes = {
        english: 'en-US',
        hindi: 'hi-IN',
        tamil: 'ta-IN'
      };
      
      utterance.lang = langCodes[currentLanguage as keyof typeof langCodes] || 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      console.log(`🗣️ Attempting to speak in ${currentLanguage}: "${text}"`);
      
      const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices();
        console.log('📢 Available voices:', voices.map(v => `${v.name} (${v.lang})`).join(', '));
        
        // Log specific Google/Microsoft voices for debugging
        const googleVoices = voices.filter(v => v.name.toLowerCase().includes('google'));
        const microsoftVoices = voices.filter(v => v.name.toLowerCase().includes('microsoft'));
        console.log('🔍 Google voices:', googleVoices.map(v => `${v.name} (${v.lang})`));
        console.log('🔍 Microsoft voices:', microsoftVoices.map(v => `${v.name} (${v.lang})`));
        
        let selectedVoice = null;
        
        if (currentLanguage === 'tamil') {
          console.log('🔍 Searching for Tamil voice...');
          console.log('🔍 Available voices for Tamil detection:', voices.map(v => `${v.name} (${v.lang})`));
          
          // Enhanced Tamil voice detection
          selectedVoice = voices.find(voice => 
            // Direct Tamil language codes
            voice.lang.toLowerCase().includes('ta-in') ||
            voice.lang.toLowerCase().includes('ta_in') ||
            voice.lang.toLowerCase() === 'ta' ||
            // Tamil voice names (various naming patterns)
            voice.name.toLowerCase().includes('tamil') ||
            voice.name.toLowerCase().includes('தமிழ்') ||
            // Common Tamil voice names in different systems
            voice.name.toLowerCase().includes('shreya') ||
            voice.name.toLowerCase().includes('lekha') ||
            voice.name.toLowerCase().includes('kalpana') ||
            voice.name.toLowerCase().includes('swara') ||
            // Google Tamil voices
            voice.name.toLowerCase().includes('google தமிழ்') ||
            voice.name.toLowerCase().includes('google tamil') ||
            // Microsoft Tamil voices
            voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('tamil')
          );
          
          console.log('Tamil voice found:', selectedVoice ? `✅ ${selectedVoice.name} (${selectedVoice.lang})` : '❌ None');
          
          // If no Tamil voice found, try forcing the system to speak Tamil text with Indian English voice
          // This often works better than expected for Tamil text
          if (!selectedVoice) {
            console.log('🔍 No Tamil voice found, searching for best Indian English voice...');
            selectedVoice = voices.find(voice => 
              (voice.lang.includes('en-IN') || voice.name.toLowerCase().includes('indian')) &&
              (voice.name.toLowerCase().includes('ravi') || 
               voice.name.toLowerCase().includes('heera') ||
               voice.name.toLowerCase().includes('veena') ||
               voice.name.toLowerCase().includes('priya'))
            );
            console.log('Indian English fallback:', selectedVoice ? `✅ ${selectedVoice.name}` : '❌ None');
            
            if (selectedVoice) {
              // Force Tamil language code even with English voice for better pronunciation
              utterance.lang = 'ta-IN';
              console.log('🔧 Using Indian English voice with Tamil language code for better pronunciation');
            }
          }
          
          // Final fallback to any English voice
          if (!selectedVoice) {
            console.log('🔍 No Indian English found, trying any English voice...');
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
            console.log('English fallback:', selectedVoice ? `✅ ${selectedVoice.name}` : '❌ None');
          }
        } else if (currentLanguage === 'hindi') {
          selectedVoice = voices.find(voice => 
            voice.lang.toLowerCase().includes('hi') ||
            voice.name.toLowerCase().includes('hindi')
          );
        } else {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`✅ Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        } else {
          console.log('⚠️ No specific voice found, using system default');
        }
        
        utterance.onstart = () => console.log(`🎵 Started speaking: "${text}"`);
        utterance.onend = () => console.log(`✅ Finished speaking`);
        utterance.onerror = (e) => {
          console.error('❌ Speech error:', e.error);
          // Retry with English if failed
          if (utterance.lang !== 'en-US') {
            console.log('🔄 Retrying with English...');
            const fallback = new SpeechSynthesisUtterance(text);
            fallback.lang = 'en-US';
            fallback.rate = 0.8;
            speechSynthesis.speak(fallback);
          }
        };
        
        speechSynthesis.speak(utterance);
      };
      
      if (speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
        setTimeout(setVoiceAndSpeak, 100); // Fallback timeout
      }
    }
  };

  // Generate greeting
  const generateGreeting = () => {
    const timeGreeting = getTimeGreeting();
    const greetings = {
      english: {
        goodMorning: `Good morning! I'm your EasyMed voice assistant. How can I help you today?`,
        goodAfternoon: `Good afternoon! I'm here to help with your health needs.`,
        goodEvening: `Good evening! How can I assist you with your health today?`
      },
      hindi: {
        goodMorning: `सुप्रभात! मैं आपका EasyMed आवाज सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?`,
        goodAfternoon: `नमस्कार! मैं आपकी स्वास्थ्य आवश्यकताओं में मदद के लिए यहां हूं।`,
        goodEvening: `शुभ संध्या! आज मैं आपके स्वास्थ्य में कैसे सहायता कर सकता हूं?`
      },
      tamil: {
        goodMorning: `காலை வணக்கம்! நான் உங்கள் EasyMed குரல் உதவியாளர். இன்று நான் எப்படி உதவ முடியும்?`,
        goodAfternoon: `மதியம் வணக்கம்! உங்கள் சுகாதார தேவைகளில் உதவ நான் இங்கே இருக்கிறேன்.`,
        goodEvening: `மாலை வணக்கம்! இன்று உங்கள் சுகாதாரத்தில் நான் எப்படி உதவ முடியும்?`
      }
    };
    
    const langGreetings = greetings[currentLanguage as keyof typeof greetings] || greetings.english;
    return langGreetings[timeGreeting as keyof typeof langGreetings];
  };

  // Enhanced voice recognition
  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      
      const langCodes = {
        english: 'en-US',
        hindi: 'hi-IN',
        tamil: 'ta-IN'
      };
      
      recognition.lang = langCodes[currentLanguage as keyof typeof langCodes] || 'en-US';
      console.log(`🎙️ Voice recognition started in ${currentLanguage} (${recognition.lang})`);
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        const startMsg = currentLanguage === 'hindi' ? 'सुन रहा हूं...' :
                        currentLanguage === 'tamil' ? 'கேட்டுக்கொண்டிருக்கிறேன்...' :
                        'Listening...';
        setResponse(startMsg);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          console.log(`🎯 Voice command: "${finalTranscript}"`);
          processVoiceCommand(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('🚫 Voice recognition error:', event.error);
        setIsListening(false);
        const errorMsg = currentLanguage === 'hindi' ? 'माफ करें, कृपया दोबारा कोशिश करें।' :
                        currentLanguage === 'tamil' ? 'மன்னிக்கவும், மீண்டும் முயற்சிக்கவும்।' :
                        'Sorry, please try again.';
        setResponse(errorMsg);
        speakText(errorMsg);
      };
      
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser.');
    }
  };

  // Enhanced voice command processing with translated responses
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    let responseText = '';
    let navigationSection = '';

    console.log(`🔄 Processing: "${command}" in ${currentLanguage}`);

    // Appointment commands
    if (lowerCommand.includes('appointment') || lowerCommand.includes('book') ||
        lowerCommand.includes('अपॉइंटमेंट') || lowerCommand.includes('बुक') ||
        lowerCommand.includes('சந்திப்பு') || lowerCommand.includes('முன்பதிவு')) {

      responseText = getVoiceCommand('goToAppointments') ||
                    (currentLanguage === 'hindi' ? 'अपॉइंटमेंट बुकिंग खोल रहा हूं।' :
                    currentLanguage === 'tamil' ? 'அப்பாயின்ட்மென்ட் புக்கிங் திறக்கிறேன்।' :
                    'Opening appointment booking.');
      navigationSection = 'appointments';
    }
    // Medicine commands
    else if (lowerCommand.includes('medicine') || lowerCommand.includes('medication') ||
             lowerCommand.includes('दवा') || lowerCommand.includes('औषधि') ||
             lowerCommand.includes('மருந்து')) {

      responseText = getVoiceCommand('medicationReminder') ||
                    (currentLanguage === 'hindi' ? 'आपकी दवाइयां दिखा रहा हूं।' :
                    currentLanguage === 'tamil' ? 'உங்கள் மருந்துகளை காட்டுகிறேன்।' :
                    'Showing your medications.');
      navigationSection = 'healthRecords';
    }
    // Emergency commands
    else if (lowerCommand.includes('emergency') || lowerCommand.includes('help') ||
             lowerCommand.includes('आपातकाल') || lowerCommand.includes('मदद') ||
             lowerCommand.includes('அவசரம்') || lowerCommand.includes('உதவி')) {

      responseText = getVoiceCommand('emergency') ||
                    (currentLanguage === 'hindi' ? 'आपातकालीन सेवाओं से जोड़ रहा हूं।' :
                    currentLanguage === 'tamil' ? 'அவசர சேவைகளுடன் இணைக்கிறேன்।' :
                    'Connecting to emergency services.');
      navigationSection = 'emergency';
    }
    // Health/Vitals commands
    else if (lowerCommand.includes('vitals') || lowerCommand.includes('health') ||
             lowerCommand.includes('वाइटल') || lowerCommand.includes('स्वास्थ्य') ||
             lowerCommand.includes('உயிர்ச்சக்தி') || lowerCommand.includes('சுகாதாரம்')) {

      responseText = getVoiceCommand('familyHealthNav') ||
                    (currentLanguage === 'hindi' ? 'आपके स्वास्थ्य संकेतक खोल रहा हूं।' :
                    currentLanguage === 'tamil' ? 'உங்கள் உயிர்ச்சக்தि கண்காணிப்பை திறக்கிறேன்।' :
                    'Opening health vitals.');
      navigationSection = 'vitalsMonitoring';
    }
    else {
      // Default response for unrecognized commands
      responseText = currentLanguage === 'hindi' ?
        `मैंने "${command}" सुना। कृपया "अपॉइंटमेंट", "दवा", "आपातकाल", या "स्वास्थ्य" कहें।` :
        currentLanguage === 'tamil' ?
        `நான் "${command}" கேட்டேன்। தயவுசெய்து "சந்திப்பு", "மருந்து", "அவசரம்", அல்லது "சுகாதாரம்" என்று சொல்லுங்கள்।` :
        `I heard "${command}". Try saying "appointment", "medicine", "emergency", or "health".`;
    }

    console.log(`💬 Response: "${responseText}"`);
    setResponse(responseText);
    speakText(responseText);

    // Trigger navigation if available
    if (navigationSection && onCommand) {
      onCommand(navigationSection, currentLanguage);
    }
  };

  const handleVoiceCommand = () => {
    if (!isInitialized) {
      const greeting = generateGreeting();
      setResponse(greeting);
      speakText(greeting);
      setIsInitialized(true);
    } else if (!isListening) {
      startVoiceRecognition();
    } else {
      setIsListening(false);
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Voice Button */}
      <button
        onClick={handleVoiceCommand}
        className={`p-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 ${
          isListening 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse focus:ring-red-300' 
            : isInitialized
            ? 'bg-gradient-to-r from-green-500 to-blue-500 focus:ring-blue-300'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 focus:ring-purple-300'
        }`}
        title={
          !isInitialized 
            ? "Start voice assistant" 
            : isListening 
            ? "Stop listening" 
            : "Start voice command"
        }
      >
        <span className="text-2xl text-white">
          {isListening ? '🔴' : '🎤'}
        </span>
      </button>

      {/* Status Display */}
      {(transcript || response) && (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs text-center">
          {transcript && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">You said:</p>
              <p className="text-sm font-medium text-gray-800">"{transcript}"</p>
            </div>
          )}
          {response && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Assistant:</p>
              <p className="text-sm text-blue-600 font-medium">{response}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
