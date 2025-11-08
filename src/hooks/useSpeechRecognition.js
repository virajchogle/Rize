import { useState, useRef, useEffect } from 'react';
import { SpeechRecognitionService } from '../services/speechRecognition';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    recognitionRef.current = new SpeechRecognitionService();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    try {
      recognitionRef.current.start((newText) => {
        setTranscript(prev => prev + newText);
      });
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
    }
  };

  const stopListening = () => {
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
    setTranscript
  };
}

