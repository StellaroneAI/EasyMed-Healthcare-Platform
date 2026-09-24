const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || '/api/ai';

type HealthQueryContext = Record<string, unknown>;

async function parseError(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    return payload?.error || 'Request failed';
  } catch {
    return 'Request failed';
  }
}

export class EnhancedVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  async speechToText(audioBlob: Blob, language?: string): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    if (language) {
      formData.append('language', language);
    }

    const response = await fetch(`${AI_API_BASE_URL}/speech-to-text`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    const payload = await response.json();
    if (!payload?.text) {
      throw new Error('Invalid speech-to-text response');
    }

    return payload.text as string;
  }

  async textToSpeech(text: string, language: string = 'english'): Promise<Blob> {
    const response = await fetch(`${AI_API_BASE_URL}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, language })
    });

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return await response.blob();
  }

  async processHealthQuery(
    query: string,
    language: string = 'english',
    context: HealthQueryContext = {}
  ): Promise<string> {
    try {
      const response = await fetch(`${AI_API_BASE_URL}/health-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, language, context })
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const payload = await response.json();
      if (payload?.answer) {
        return payload.answer as string;
      }
    } catch (error) {
      console.error('AI query request failed:', error);
    }

    return 'I can help with general wellness guidance, but for urgent or serious symptoms please contact a licensed healthcare professional immediately.';
  }

  async startRecording(): Promise<void> {
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

    this.mediaRecorder.start(1000);
    this.isRecording = true;
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        this.mediaRecorder?.stream?.getTracks().forEach((track) => track.stop());
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const audioUrl = URL.createObjectURL(audioBlob);

      audio.src = audioUrl;
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Failed to play audio'));
      };

      audio.play().catch(reject);
    });
  }

  get recording(): boolean {
    return this.isRecording;
  }
}

export const voiceService = new EnhancedVoiceService();

export class HealthVoiceCommands {
  static processCommand(transcript: string, language: string): any {
    const lowerTranscript = transcript.toLowerCase();

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

    return { action: 'chat', query: transcript };
  }
}
