/**
 * Transcribes recorded audio chunks (includes both mic + system audio)
 * Uses MLH Gemini API to process the recorded audio
 */
export class RecordedAudioTranscriptionService {
  constructor() {
    this.isActive = false;
    this.onTranscriptCallback = null;
    this.audioChunks = [];
    this.mediaRecorder = null;
    this.intervalId = null;
    this.geminiApiUrl = 'https://mlh.link/gemini';
    this.processedChunks = 0;
  }

  async start(audioStream, onTranscript) {
    try {
      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks in stream');
      }

      this.onTranscriptCallback = onTranscript;
      this.isActive = true;
      this.audioChunks = [];
      this.processedChunks = 0;

      // Create MediaRecorder to capture audio chunks
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

      // Process audio chunks periodically (every 15 seconds)
      this.intervalId = setInterval(async () => {
        if (this.audioChunks.length > 0 && this.isActive) {
          await this.processAudioChunks();
        }
      }, 15000); // Process every 15 seconds

      return true;
    } catch (error) {
      console.error('Failed to start recorded audio transcription:', error);
      throw error;
    }
  }

  async processAudioChunks() {
    if (this.audioChunks.length === 0 || !this.isActive) return;

    try {
      // Get chunks to process (keep some for next iteration)
      const chunksToProcess = [...this.audioChunks];
      this.audioChunks = []; // Clear for next batch

      if (chunksToProcess.length === 0) return;

      const audioBlob = new Blob(chunksToProcess, { type: 'audio/webm' });
      
      if (audioBlob.size < 5000) {
        // Too small, put back
        this.audioChunks = chunksToProcess;
        return;
      }

      console.log('Processing recorded audio chunk:', audioBlob.size, 'bytes');

      // Try FormData first
      const formData = new FormData();
      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);
      formData.append('file', audioFile);

      let response;
      try {
        response = await fetch(this.geminiApiUrl, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          // Try JSON with base64
          const base64Audio = await this.blobToBase64(audioBlob);
          response = await fetch(this.geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio: base64Audio,
              file: base64Audio,
              format: 'webm'
            })
          });
        }

        if (!response.ok) {
          console.error('Transcription API error:', response.status);
          return;
        }

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { transcript: text, text: text };
        }

        const transcript = data.transcript || data.text || data.result || data.output || data.content || '';
        
        if (transcript && transcript.trim() && this.onTranscriptCallback) {
          console.log('Got transcript from recorded audio:', transcript);
          this.onTranscriptCallback(transcript.trim());
          this.processedChunks++;
        }
      } catch (error) {
        console.error('Error calling transcription API:', error);
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

  async getFinalTranscript() {
    if (this.audioChunks.length > 0) {
      await this.processAudioChunks();
    }
  }
}

