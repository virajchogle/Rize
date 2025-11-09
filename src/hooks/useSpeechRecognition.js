import { useState } from 'react';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const transcribeAudio = async (audioBlob) => {
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('No audio data to transcribe');
    }

    setIsTranscribing(true);
    setTranscript('Transcribing...');

    try {
      // Determine API URL based on environment
      const isProd = import.meta.env.PROD;
      const apiUrl = isProd 
        ? '/api/assemblyai-transcribe'
        : 'http://localhost:3001/api/assemblyai-transcribe';

      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Send to backend for transcription
      const response = await fetch(apiUrl, {
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
        throw new Error(errorData.message || `Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      const transcribedText = data.text || data.transcript || '';
      
      setTranscript(transcribedText);
      setIsTranscribing(false);
      
      return transcribedText;
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscript(`Error: ${error.message}`);
      setIsTranscribing(false);
      throw error;
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    isTranscribing,
    transcribeAudio,
    clearTranscript,
    setTranscript
  };
}

// Helper function to convert blob to base64
function blobToBase64(blob) {
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
