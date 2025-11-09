/**
 * Hybrid transcription using Web Speech API (real-time) + AssemblyAI (recorded chunks)
 * Since real-time streaming API requires paid plan, we use regular transcription API
 */
import { SpeechRecognitionService } from './speechRecognition';

export class AssemblyAITranscriptionService {
  constructor() {
    this.isActive = false;
    this.onTranscriptCallback = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.intervalId = null;
    this.webSpeechService = null; // For real-time user voice transcription
    this.apiUrl = null;
  }

  async start(audioStream, onTranscript) {
    try {
      this.onTranscriptCallback = onTranscript;
      this.isActive = true;
      this.audioChunks = [];

      // Determine API URL based on environment
      const isProd = import.meta.env.PROD;
      this.apiUrl = isProd 
        ? '/api/assemblyai-transcribe'
        : 'http://localhost:3001/api/assemblyai-transcribe';

      // Start Web Speech API for real-time user voice transcription
      this.webSpeechService = new SpeechRecognitionService();
      this.webSpeechService.start((newText) => {
        // Real-time transcription of user's voice
        if (this.onTranscriptCallback) {
          this.onTranscriptCallback(newText, true);
        }
      });

      // Create MediaRecorder to capture audio chunks (includes both mic + system audio)
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus'
      ];
      
      let mimeType = 'audio/webm';
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(audioStream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(5000); // Collect audio every 5 seconds

      // Process audio chunks periodically (every 10 seconds) using AssemblyAI
      this.intervalId = setInterval(async () => {
        if (this.audioChunks.length > 0 && this.isActive) {
          await this.processAudioChunks();
        }
      }, 10000); // Process every 10 seconds

      return true;
    } catch (error) {
      console.error('Failed to start transcription:', error);
      this.isActive = false;
      throw error;
    }
  }

  async processAudioChunks() {
    if (this.audioChunks.length === 0 || !this.isActive) return;

    try {
      // Get chunks to process
      const chunksToProcess = [...this.audioChunks];
      this.audioChunks = []; // Clear for next batch

      if (chunksToProcess.length === 0) return;

      const audioBlob = new Blob(chunksToProcess, { type: 'audio/webm' });
      
      if (audioBlob.size < 10000) {
        // Too small, put back
        this.audioChunks = chunksToProcess;
        return;
      }

      console.log('Processing audio chunk with AssemblyAI:', audioBlob.size, 'bytes');

      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);

      // Send to backend for transcription
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio: base64Audio,
          format: 'webm'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AssemblyAI transcription error:', response.status, errorData);
        return;
      }

      const data = await response.json();
      const transcript = data.text || data.transcript || '';
      
      if (transcript && transcript.trim() && this.onTranscriptCallback) {
        console.log('Got transcript from AssemblyAI:', transcript);
        // Add transcript from recorded audio (both sides of call)
        this.onTranscriptCallback(transcript.trim(), true);
      }
    } catch (error) {
      console.error('Error processing audio chunks:', error);
    }
  }

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  stop() {
    this.isActive = false;

    if (this.webSpeechService) {
      this.webSpeechService.stop();
      this.webSpeechService = null;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Process any remaining chunks
    if (this.audioChunks.length > 0) {
      this.processAudioChunks();
    }
  }

  getFullTranscript() {
    return '';
  }
}
