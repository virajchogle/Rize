import { useState } from 'react';
import { FileText, Mail, Loader2, Copy, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import { useNeuralSeekAnalysis } from '../hooks/useNeuralSeekAnalysis';

export default function CallAnalyzer({ transcript }) {
  const [emailRecipients, setEmailRecipients] = useState('');
  const [copied, setCopied] = useState(false);
  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const { analysis, isAnalyzing, error, analyze, reset } = useNeuralSeekAnalysis();

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      alert('Please provide a transcript first');
      return;
    }
    
    try {
      await analyze(transcript, emailRecipients);
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    }
  };

  const handleGenerateEmail = async () => {
    if (!transcript.trim()) {
      alert('Please provide a transcript first');
      return;
    }
    
    setShowEmailGenerator(true);
    try {
      await analyze(transcript, emailRecipients);
    } catch (err) {
      alert('Email generation failed: ' + err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!transcript.trim()) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-purple-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Smart Insights</h2>
      </div>

      {/* Main Action Buttons */}
      {!analysis && !showEmailGenerator && (
        <div className="space-y-4">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-98 shadow-lg shadow-purple-500/30"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Get Insights
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleGenerateEmail}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-98 shadow-lg shadow-green-500/30"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Generate Follow-up Email
              </>
            )}
          </button>
        </div>
      )}

      {/* Email Recipients Input (shown when generating email) */}
      {showEmailGenerator && !analysis && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Recipients (optional)
          </label>
          <input
            type="text"
            value={emailRecipients}
            onChange={(e) => setEmailRecipients(e.target.value)}
            placeholder="john@example.com, jane@example.com"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          <button
            onClick={handleGenerateEmail}
            disabled={isAnalyzing}
            className="w-full mt-4 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Email...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Generate Email
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-8 space-y-6">
          {/* Summary */}
          {analysis.summary && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {/* Key Points */}
          {analysis.keyPoints && analysis.keyPoints.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Key Points
              </h3>
              <ul className="space-y-2">
                {analysis.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {analysis.actionItems && analysis.actionItems.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Action Items
              </h3>
              <ul className="space-y-2">
                {analysis.actionItems.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 bg-green-50 p-4 rounded-lg border border-green-100">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Email Body */}
          {analysis.emailBody && (
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Follow-up Email
                </h3>
                <button
                  onClick={() => copyToClipboard(analysis.emailBody)}
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
                {analysis.emailBody}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                reset();
                setShowEmailGenerator(false);
              }}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              New Analysis
            </button>
            <button
              onClick={handleGenerateEmail}
              disabled={isAnalyzing}
              className="flex-1 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              Generate Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
