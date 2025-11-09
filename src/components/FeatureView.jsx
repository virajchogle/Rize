import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { analyzeFeature } from '../services/featureAPI';

export default function FeatureView({ feature, transcript, onBack, cachedResult, onResult, onClearCache }) {
  const [result, setResult] = useState(cachedResult || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const Icon = feature.icon;

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeFeature(feature.id, transcript);
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-process only if no cached result exists
  useEffect(() => {
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

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Display result based on feature type */}
          {feature.id === 'summarize' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.summary || result.text || JSON.stringify(result, null, 2)}</p>
            </div>
          )}

          {feature.id === 'generate-email' && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Follow-up Email</h3>
                <button
                  onClick={() => copyToClipboard(result.emailBody || result.text || JSON.stringify(result, null, 2))}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono">
                {result.emailBody || result.text || JSON.stringify(result, null, 2)}
              </div>
            </div>
          )}

          {(feature.id === 'heatmap' || feature.id === 'feature-requests' || feature.id === 'call-dashboard') && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-3">Visualization</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 This data can be used to generate visualizations in your analytics tools.
              </p>
            </div>
          )}

          {feature.id === 'call-notes' && (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100">
              <h3 className="font-semibold text-gray-900 mb-3">Structured Call Notes</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
              <button
                onClick={() => {
                  const csv = convertToCSV(result);
                  downloadCSV(csv, 'call-notes.csv');
                }}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
              >
                Download as CSV
              </button>
            </div>
          )}

          {feature.id === 'call-scoring' && (
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-100">
              <h3 className="font-semibold text-gray-900 mb-3">Performance Score</h3>
              {result.score && (
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-yellow-600">{result.score}</div>
                  <p className="text-sm text-gray-600 mt-2">Overall Performance</p>
                </div>
              )}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Default display for other features */}
          {!['summarize', 'generate-email', 'heatmap', 'feature-requests', 'call-dashboard', 'call-notes', 'call-scoring'].includes(feature.id) && (
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

// Helper functions
function convertToCSV(data) {
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }
  return JSON.stringify(data);
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

