/**
 * Handles speech-to-text transcription using Web Speech API
 */
export class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      this.recognition = null;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    
    this.isActive = false;
    this.onTranscriptCallback = null;
  }

  start(onTranscript) {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    this.onTranscriptCallback = onTranscript;
    
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }

      if (finalTranscript && this.onTranscriptCallback) {
        this.onTranscriptCallback(finalTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.start();
    this.isActive = true;
  }

  stop() {
    if (this.recognition && this.isActive) {
      this.recognition.stop();
      this.isActive = false;
    }
  }
}

