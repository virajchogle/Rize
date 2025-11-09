import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { analyzeFeature } from '../services/featureAPI';
import CallSummary from './CallSummary';
import EmailTemplate from './EmailTemplate';
import Heatmap from './Heatmap';
import FeedbackReport from './FeedbackReport';
import SingleCallDashboard from './SingleCallDashboard';
import CallScoring from './CallScoring';
import PiiAnalysis from './PiiAnalysis';
import PipelineMomentum from './PipelineMomentum';

export default function FeatureView({ feature, transcript, onBack, cachedResult, onResult, onClearCache }) {
  const [result, setResult] = useState(cachedResult || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const Icon = feature.icon;

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeFeature(feature.id, transcript);
      console.log(`[${feature.id}] Analysis result:`, data);
      console.log(`[${feature.id}] Summary:`, data.summary);
      console.log(`[${feature.id}] Key Points:`, data.keyPoints);
      console.log(`[${feature.id}] Action Items:`, data.actionItems);
      setResult(data);
      onResult(data); // Cache the result in parent
    } catch (err) {
      setError(err.message || 'Failed to process feature');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReprocess = () => {
    onClearCache(); // Clear cached result
    handleProcess(); // Re-run processing
  };

  const handleReanalyzeWithCSV = async (csvTranscript) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Analyzing CSV data, length:', csvTranscript?.length || 0);
      // Pass CSV data as transcript
      const data = await analyzeFeature(feature.id, csvTranscript);
      console.log('Analysis result received:', data);
      setResult(data);
      onResult(data); // Cache the result in parent
    } catch (err) {
      console.error('CSV analysis error:', err);
      setError(err.message || 'Failed to process feature');
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-process only if no cached result exists
  // Skip auto-processing for pipeline-analyzer (requires CSV upload)
  useEffect(() => {
    if (feature.id === 'pipeline-analyzer') {
      // Don't auto-process for pipeline analyzer - wait for CSV upload
      return;
    }
    
    if (!cachedResult && !result && !isProcessing && !error && transcript) {
      handleProcess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{feature.title}</h2>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Processing your transcript...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={handleProcess}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Pipeline Momentum Feature - Always show (doesn't require initial result) */}
      {feature.id === 'pipeline-analyzer' && (
        <div className="space-y-6">
          <PipelineMomentum result={result} onReanalyze={handleReanalyzeWithCSV} />
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Back to Features
            </button>
          </div>
        </div>
      )}

      {/* All Other Features - Only show when there's a result */}
      {feature.id !== 'pipeline-analyzer' && result && (
        <div className="space-y-6">
          {/* Display result based on feature type */}
          {/* Call Summary Feature */}
          {feature.id === 'summarize' && (
            <CallSummary result={result} />
          )}

          {/* Generate Email Feature */}
          {feature.id === 'generate-email' && (
            <EmailTemplate result={result} />
          )}

          {/* Heatmap Feature */}
          {feature.id === 'heatmap' && (
            <Heatmap result={result} />
          )}

          {/* Feedback Report Feature */}
          {feature.id === 'feature-requests' && (
            <FeedbackReport result={result} />
          )}

          {/* Single Call Dashboard Feature */}
          {feature.id === 'call-dashboard' && (
            <SingleCallDashboard result={result} />
          )}

          {/* Call Scoring Feature */}
          {feature.id === 'call-scoring' && (
            <CallScoring result={result} />
          )}

          {/* PII Wipe & Analysis Feature */}
          {feature.id === 'pii-wipe' && (
            <PiiAnalysis result={result} />
          )}

          {/* Default display for other features */}
          {!['summarize', 'generate-email', 'heatmap', 'feature-requests', 'call-dashboard', 'call-scoring', 'pii-wipe', 'pipeline-analyzer'].includes(feature.id) && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Results</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Back to Features
            </button>
            <button
              onClick={handleReprocess}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Re-process'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
