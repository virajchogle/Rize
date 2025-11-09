import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import CallRecorder from './CallRecorder';
import TranscriptDisplay from './TranscriptDisplay';
import FeaturesGrid from './FeaturesGrid';
import FeatureView from './FeatureView';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

// Import icons
import { Mail, FileText, Map, TrendingUp, BarChart3, FileSpreadsheet, Calendar, Award, LineChart, Shield } from 'lucide-react';

// Feature definitions for lookup
const features = [
  {
    id: 'summarize',
    title: 'Summarize',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    iconColor: 'text-blue-600'
  },
  {
    id: 'generate-email',
    title: 'Generate Email',
    icon: Mail,
    color: 'from-green-500 to-emerald-600',
    iconColor: 'text-green-600'
  },
  {
    id: 'heatmap',
    title: 'Talk Track Heatmap',
    icon: Map,
    color: 'from-orange-500 to-orange-600',
    iconColor: 'text-orange-600'
  },
  {
    id: 'feature-requests',
    title: 'Feature Highrequest',
    icon: TrendingUp,
    color: 'from-purple-500 to-purple-600',
    iconColor: 'text-purple-600'
  },
  {
    id: 'call-dashboard',
    title: 'Single Call Review',
    icon: BarChart3,
    color: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-600'
  },
  {
    id: 'call-notes',
    title: 'Call Notes to Sheet',
    icon: FileSpreadsheet,
    color: 'from-teal-500 to-teal-600',
    iconColor: 'text-teal-600'
  },
  {
    id: 'call-prep',
    title: 'Call Preparation',
    icon: Calendar,
    color: 'from-pink-500 to-pink-600',
    iconColor: 'text-pink-600'
  },
  {
    id: 'call-scoring',
    title: 'Call Scoring',
    icon: Award,
    color: 'from-yellow-500 to-yellow-600',
    iconColor: 'text-yellow-600'
  },
  {
    id: 'pipeline-analyzer',
    title: 'Pipeline Momentum',
    icon: LineChart,
    color: 'from-cyan-500 to-cyan-600',
    iconColor: 'text-cyan-600'
  },
  {
    id: 'pii-wipe',
    title: 'PII Wipe & Analyze',
    icon: Shield,
    color: 'from-red-500 to-red-600',
    iconColor: 'text-red-600'
  }
];

export default function CallTranscriptionApp({ onBack, initialFeature }) {
  const [transcript, setTranscript] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [featureResults, setFeatureResults] = useState({}); // Cache results per feature
  const { toast, showToast, hideToast } = useToast();
  const { featureId } = useParams();
  const navigate = useNavigate();

  // Load transcript from localStorage on mount
  useEffect(() => {
    const savedTranscript = localStorage.getItem('rize_transcript');
    if (savedTranscript) {
      setTranscript(savedTranscript);
    }
  }, []);

  // Handle initial feature or URL param feature
  useEffect(() => {
    const targetFeatureId = featureId || initialFeature;
    if (targetFeatureId) {
      const feature = features.find(f => f.id === targetFeatureId);
      if (feature) {
        setSelectedFeature(feature);
      }
    }
  }, [featureId, initialFeature]);

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
    navigate(`/call-recording/${feature.id}`);
  };

  const handleBackToFeatures = () => {
    setSelectedFeature(null);
    navigate('/call-recording');
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
