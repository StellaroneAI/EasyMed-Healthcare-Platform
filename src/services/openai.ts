export class EnhancedVoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;

  async speechToText(audioBlob: Blob, language?: string): Promise<string> {
    const form = new FormData();
    form.append('audio', audioBlob, 'audio.webm');
    if (language) form.append('language', language);
    const response = await fetch('/api/ai/transcribe', { method: 'POST', body: form, credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to transcribe audio');
    return data.text;
  }

  async textToSpeech(text: string, language = 'english'): Promise<Blob> {
    const response = await fetch('/api/ai/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text, language }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to generate speech');
    }
    return await response.blob();
  }

  async processHealthQuery(query: string, language = 'english', context: any = {}): Promise<string> {
    const response = await fetch('/api/ai/health-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query, language, context }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to process health query');
    return data.answer;
  }

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    this.audioChunks = [];
    this.mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) this.audioChunks.push(event.data);
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
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isRecording = false;
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Failed to play audio'));
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
      if (lowerTranscript.includes('appointment') || lowerTranscript.includes('book')) return { action: 'navigate', target: 'appointments' };
      if (lowerTranscript.includes('medicine') || lowerTranscript.includes('medication')) return { action: 'navigate', target: 'medications' };
      if (lowerTranscript.includes('emergency') || lowerTranscript.includes('help')) return { action: 'emergency', target: '108' };
    }
    if (language === 'hindi') {
      if (lowerTranscript.includes('अपॉइंटमेंट') || lowerTranscript.includes('मुलाकात')) return { action: 'navigate', target: 'appointments' };
      if (lowerTranscript.includes('दवा') || lowerTranscript.includes('औषधि')) return { action: 'navigate', target: 'medications' };
      if (lowerTranscript.includes('आपातकाल') || lowerTranscript.includes('मदद')) return { action: 'emergency', target: '108' };
    }
    return { action: 'chat', query: transcript };
  }
}
export default voiceService;
