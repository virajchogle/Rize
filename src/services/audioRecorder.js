/**
 * Handles audio recording from both microphone and system audio
 */
export class DualAudioRecorder {
  constructor() {
    this.audioContext = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.micStream = null;
    this.systemStream = null;
  }

  async startRecording(micDeviceId = null, onSystemAudioPrompt = null) {
    try {
      // Step 1: Get microphone stream (user's voice)
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: micDeviceId ? { deviceId: { exact: micDeviceId } } : true
      });

      // Step 2: Get system audio (call audio - other person's voice)
      // This requires screen/audio sharing permission
      if (onSystemAudioPrompt) {
        onSystemAudioPrompt();
      }
      
      try {
        // Request system/window audio capture (for Zoom, Google Meet, etc.)
        // User will see a browser prompt to share screen/audio
        // They should select "Entire Screen" or "Window" with audio enabled
        // Note: We don't specify preferCurrentTab so user can choose window/screen
        this.systemStream = await navigator.mediaDevices.getDisplayMedia({
          video: true, // Request video (user can choose screen/window/tab)
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            suppressLocalAudioPlayback: false
          }
        });

        // Stop video tracks if we only want audio
        if (this.systemStream.getVideoTracks().length > 0) {
          this.systemStream.getVideoTracks().forEach(track => track.stop());
        }

        // Check if we actually got audio
        const audioTracks = this.systemStream.getAudioTracks();
        if (audioTracks.length === 0) {
          console.warn('System audio not captured - user may not have selected audio sharing');
          this.systemStream = null;
          throw new Error('System audio is required for call recording. Please allow audio sharing when prompted.');
        } else {
          console.log('System audio captured successfully');
        }
      } catch (err) {
        console.warn('System audio capture failed:', err.message);
        // If user cancelled or didn't allow, throw error
        if (err.message.includes('System audio')) {
          throw err;
        }
        this.systemStream = null;
        throw new Error('System audio is required for call recording. Please allow audio sharing when prompted.');
      }

      // Create audio context to mix streams
      this.audioContext = new AudioContext();
      const destination = this.audioContext.createMediaStreamDestination();
      
      // Store the mixed stream for transcription
      this.mixedStream = destination.stream;
      
      // Add microphone
      const micSource = this.audioContext.createMediaStreamSource(this.micStream);
      micSource.connect(destination);
      
      // Add system audio if available
      if (this.systemStream) {
        const systemSource = this.audioContext.createMediaStreamSource(this.systemStream);
        systemSource.connect(destination);
      }

      // Create recorder
      this.mediaRecorder = new MediaRecorder(destination.stream);
      this.chunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      
      // Return the mixed audio stream for transcription
      return { 
        hasSystemAudio: !!this.systemStream,
        audioStream: this.mixedStream // Mixed audio stream for transcription
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
        
        // Clean up
        if (this.micStream) {
          this.micStream.getTracks().forEach(track => track.stop());
        }
        if (this.systemStream) {
          this.systemStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
          this.audioContext.close();
        }

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

