import { useState, useEffect } from 'react';
import Header from './Header';
import CallRecorder from './CallRecorder';
import TranscriptDisplay from './TranscriptDisplay';
import FeaturesGrid from './FeaturesGrid';
import FeatureView from './FeatureView';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

export default function CallTranscriptionApp({ onBack }) {
  const [transcript, setTranscript] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureResults, setFeatureResults] = useState({}); // Cache results per feature
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

  const handleFeatureSelect = (feature) => {
    setSelectedFeature(feature);
  };

  const handleBackToFeatures = () => {
    setSelectedFeature(null);
  };

  const handleFeatureResult = (featureId, result) => {
    setFeatureResults(prev => ({
      ...prev,
      [featureId]: result
    }));
  };

  const handleClearFeatureResult = (featureId) => {
    setFeatureResults(prev => {
      const updated = { ...prev };
      delete updated[featureId];
      return updated;
    });
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
        <Header onBack={onBack} showBack={!selectedFeature} />
        
        {/* Show transcript at top when feature is selected */}
        {selectedFeature && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Working with transcript:</h3>
            <TranscriptDisplay 
              transcript={transcript} 
              onTranscriptChange={handleTranscriptChange}
              compact={true}
            />
          </div>
        )}

        {/* Minimize recorder when feature is selected */}
        {!selectedFeature && (
          <CallRecorder onTranscriptUpdate={handleTranscriptChange} />
        )}

        {/* Show transcript display only when no feature is selected */}
        {!selectedFeature && (
          <TranscriptDisplay 
            transcript={transcript} 
            onTranscriptChange={handleTranscriptChange}
          />
        )}

        {/* Show feature view or features grid */}
        {selectedFeature ? (
          <FeatureView
            feature={selectedFeature}
            transcript={transcript}
            onBack={handleBackToFeatures}
            cachedResult={featureResults[selectedFeature.id]}
            onResult={(result) => handleFeatureResult(selectedFeature.id, result)}
            onClearCache={() => handleClearFeatureResult(selectedFeature.id)}
          />
        ) : (
          <FeaturesGrid
            transcript={transcript}
            onFeatureSelect={handleFeatureSelect}
          />
        )}
        
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
