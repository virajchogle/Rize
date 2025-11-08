import { useState, useEffect } from 'react';
import Header from './Header';
import CallRecorder from './CallRecorder';
import TranscriptDisplay from './TranscriptDisplay';
import CallAnalyzer from './CallAnalyzer';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

export default function CallTranscriptionApp({ onBack }) {
  const [transcript, setTranscript] = useState('');
  const { toast, showToast, hideToast } = useToast();

  // Load transcript from localStorage on mount
  useEffect(() => {
    const savedTranscript = localStorage.getItem('rize_transcript');
    if (savedTranscript) {
      setTranscript(savedTranscript);
    }
  }, []);

  // Save transcript to localStorage whenever it changes
  useEffect(() => {
    if (transcript) {
      localStorage.setItem('rize_transcript', transcript);
    }
  }, [transcript]);

  const handleTranscriptChange = (newTranscript) => {
    setTranscript(newTranscript);
    if (newTranscript.trim()) {
      showToast('Transcript saved automatically', 'success', 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 py-12 px-4 relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
      <div className="max-w-5xl mx-auto space-y-8">
        <Header onBack={onBack} showBack={true} />
        <CallRecorder onTranscriptUpdate={handleTranscriptChange} />
        <TranscriptDisplay transcript={transcript} onTranscriptChange={handleTranscriptChange} />
        <CallAnalyzer transcript={transcript} />
        
        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Powered by NeuralSeek AI • Secure & Confidential
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Transcripts are saved automatically to your browser
          </p>
        </div>
      </div>
    </div>
  );
}
