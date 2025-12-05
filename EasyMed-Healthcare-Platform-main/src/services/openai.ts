import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY, // Make sure to add this to your .env file
  dangerouslyAllowBrowser: true // Only for demo - in production, use a backend
});

export class EnhancedVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  /**
   * Speech-to-Text using OpenAI Whisper
   * Supports all languages much better than browser speech recognition
   */
  async speechToText(audioBlob: Blob, language?: string): Promise<string> {
    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], 'audio.webm', { 
        type: 'audio/webm' 
      });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: this.getWhisperLanguageCode(language), // Optional: specify language
        response_format: 'text',
        temperature: 0.1 // Lower temperature for more accurate transcription
      });

      return transcription;
    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  /**
   * Text-to-Speech using OpenAI TTS
   * High quality voice synthesis in multiple languages
   */
  async textToSpeech(text: string, language: string = 'english'): Promise<Blob> {
    try {
      const voice = this.getOptimalVoice(language);
      
      const response = await openai.audio.speech.create({
        model: 'tts-1-hd', // High quality model
        voice: voice,
        input: text,
        response_format: 'mp3',
        speed: 0.9 // Slightly slower for better comprehension
      });

      const audioBlob = new Blob([await response.arrayBuffer()], { 
        type: 'audio/mpeg' 
      });
      
      return audioBlob;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Enhanced AI Chat with multilingual support
   */
  async processHealthQuery(
    query: string, 
    language: string = 'english',
    context: any = {}
  ): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt(language, context);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0]?.message?.content || 'I apologize, I could not process your request.';
    } catch (error) {
      console.error('AI chat error:', error);
      throw new Error('Failed to process health query');
    }
  }

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw new Error('Microphone access denied');
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: 'audio/webm' 
        });
        this.isRecording = false;
        
        // Stop all tracks
        this.mediaRecorder?.stream?.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Play audio blob
   */
  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audio.src = audioUrl;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Failed to play audio'));
      };
      
      audio.play().catch(reject);
    });
  }

  /**
   * Get optimal OpenAI voice for language
   */
  private getOptimalVoice(language: string): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' {
    const voiceMapping = {
      english: 'nova',      // Clear female voice
      hindi: 'alloy',       // Good for Indian languages
      tamil: 'shimmer',     // Melodic voice
      telugu: 'alloy',
      bengali: 'echo',      // Male voice for variation
      marathi: 'nova',
      punjabi: 'fable',
      gujarati: 'shimmer',
      kannada: 'nova',
      malayalam: 'alloy',
      odia: 'echo',
      assamese: 'fable'
    };

    return voiceMapping[language as keyof typeof voiceMapping] || 'nova';
  }

  /**
   * Get Whisper language codes for better recognition
   */
  private getWhisperLanguageCode(language?: string): string | undefined {
    if (!language) return undefined;
    
    const languageCodes = {
      english: 'en',
      hindi: 'hi',
      tamil: 'ta',
      telugu: 'te',
      bengali: 'bn',
      marathi: 'mr',
      punjabi: 'pa',
      gujarati: 'gu',
      kannada: 'kn',
      malayalam: 'ml',
      odia: 'or',
      assamese: 'as'
    };

    return languageCodes[language as keyof typeof languageCodes];
  }

  /**
   * Get system prompt for AI assistant in different languages
   */
  private getSystemPrompt(language: string, context: any): string {
    const prompts = {
      english: `You are EasyMedPro's AI health assistant. Provide helpful, accurate health information in simple English. Keep responses concise (2-3 sentences). Always recommend consulting healthcare professionals for serious concerns.`,
      
      hindi: `आप EasyMedPro के AI स्वास्थ्य सहायक हैं। सरल हिंदी में उपयोगी, सटीक स्वास्थ्य जानकारी प्रदान करें। जवाब संक्षिप्त रखें (2-3 वाक्य)। गंभीर समस्याओं के लिए हमेशा स्वास्थ्य पेशेवरों से सलाह लेने की सिफारिश करें।`,
      
      tamil: `நீங்கள் EasyMedPro இன் AI சுகாதார உதவியாளர். எளிய தமிழில் பயனுள்ள, துல்லியமான சுகாதார தகவல்களை வழங்கவும். பதில்களை சுருக்கமாக வைக்கவும் (2-3 வாக்கியங்கள்). தீவிர கவலைகளுக்கு எப்போதும் சுகாதார நிபுணர்களை அணுக பரிந்துரைக்கவும்।`,
      
      telugu: `మీరు EasyMedPro యొక్క AI ఆరోగ్య సహాయకులు. సరళమైన తెలుగులో ఉపయోగకరమైన, ఖచ్చితమైన ఆరోగ్య సమాచారాన్ని అందించండి. ప్రతిస్పందనలను సంక్షిప్తంగా ఉంచండి (2-3 వాక్యాలు). తీవ్రమైన ఆందోళనల కోసం ఎల్లప్పుడూ ఆరోగ్య నిపుణులను సంప్రదించాలని సిఫార్సు చేయండి।`,
      
      // Add more languages as needed...
    };

    return prompts[language as keyof typeof prompts] || prompts.english;
  }

  /**
   * Check if recording is in progress
   */
  get recording(): boolean {
    return this.isRecording;
  }
}

// Export singleton instance
export const voiceService = new EnhancedVoiceService();

// Health-specific voice commands processor
export class HealthVoiceCommands {
  static processCommand(transcript: string, language: string): any {
    const lowerTranscript = transcript.toLowerCase();
    
    // English commands
    if (language === 'english') {
      if (lowerTranscript.includes('appointment') || lowerTranscript.includes('book')) {
        return { action: 'navigate', target: 'appointments' };
      }
      if (lowerTranscript.includes('medicine') || lowerTranscript.includes('medication')) {
        return { action: 'navigate', target: 'medications' };
      }
      if (lowerTranscript.includes('emergency') || lowerTranscript.includes('help')) {
        return { action: 'emergency', target: '108' };
      }
    }
    
    // Hindi commands
    if (language === 'hindi') {
      if (lowerTranscript.includes('अपॉइंटमेंट') || lowerTranscript.includes('मुलाकात')) {
        return { action: 'navigate', target: 'appointments' };
      }
      if (lowerTranscript.includes('दवा') || lowerTranscript.includes('औषधि')) {
        return { action: 'navigate', target: 'medications' };
      }
      if (lowerTranscript.includes('आपातकाल') || lowerTranscript.includes('मदद')) {
        return { action: 'emergency', target: '108' };
      }
    }
    
    // Add more language-specific commands...
    
    return { action: 'chat', query: transcript };
  }
}
