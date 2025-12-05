import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SimpleVoiceAssistantProps {
  userName?: string;
  onCommand?: (command: string) => void;
}

export default function SimpleVoiceAssistant({ 
  userName = "User", 
  onCommand 
}: SimpleVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const { t, currentLanguage } = useLanguage();

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = currentLanguage === 'hindi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResponse('');
      };

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        processCommand(speechResult);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setResponse('Sorry, I couldn\'t hear you clearly. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      setResponse('Voice recognition is not supported in this browser.');
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const processCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    let responseText = '';

    if (lowerCommand.includes('appointment') || lowerCommand.includes('booking')) {
      responseText = t('bookAppointment');
      onCommand?.('appointments');
    } else if (lowerCommand.includes('medicine') || lowerCommand.includes('medication')) {
      responseText = t('medications');
      onCommand?.('medications');
    } else if (lowerCommand.includes('emergency') || lowerCommand.includes('help')) {
      responseText = t('emergency108');
      onCommand?.('emergency');
    } else if (lowerCommand.includes('family') || lowerCommand.includes('health')) {
      responseText = t('familyHealth');
      onCommand?.('family');
    } else {
      responseText = `Hello ${userName}, I heard: "${command}". How can I help you with your health today?`;
    }

    setResponse(responseText);
    
    // Speak the response
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(responseText);
      utterance.lang = currentLanguage === 'hindi' ? 'hi-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🎤 {t('aiChat')}</h3>
        <div className="flex gap-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isListening}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>

      {isListening && (
        <div className="mb-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-blue-800 font-medium">{t('listening')}</p>
          <div className="flex gap-1 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}

      {transcript && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-gray-700"><strong>You said:</strong> {transcript}</p>
        </div>
      )}

      {response && (
        <div className="mb-4 p-3 bg-green-100 rounded-lg">
          <p className="text-green-800"><strong>Assistant:</strong> {response}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>Try saying:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>"Book an appointment"</li>
          <li>"Check my medications"</li>
          <li>"Emergency help"</li>
          <li>"Family health"</li>
        </ul>
      </div>
    </div>
  );
}
