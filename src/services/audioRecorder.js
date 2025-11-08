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

  async startRecording(micDeviceId = null) {
    try {
      // Get microphone stream
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: micDeviceId ? { deviceId: { exact: micDeviceId } } : true
      });

      // Try to get system audio (optional - may not work on all browsers)
      try {
        this.systemStream = await navigator.mediaDevices.getDisplayMedia({
          video: false,
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });
      } catch (err) {
        console.log('System audio not available, using mic only');
      }

      // Create audio context to mix streams
      this.audioContext = new AudioContext();
      const destination = this.audioContext.createMediaStreamDestination();
      
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
      return true;
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

