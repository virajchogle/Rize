import { useEffect, useState } from 'react';
import { Shield, User, MessageSquare, CheckCircle, Download, Copy } from 'lucide-react';

export default function PiiAnalysis({ result }) {
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    if (!result || !result.rawResponse) {
      setError('No data available for PII analysis');
      return;
    }

    try {
      // Extract data from rawResponse.answer
      const answer = result.rawResponse.answer || '';
      
      if (!answer) {
        setError('No PII analysis data in response');
        return;
      }

      // Try to parse as JSON (wrapped in ```json or plain JSON)
      let parsedData = null;
      
      // Remove markdown code block if present
      let cleanedAnswer = answer.trim();
      if (cleanedAnswer.startsWith('```json')) {
        cleanedAnswer = cleanedAnswer.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
      } else if (cleanedAnswer.startsWith('```')) {
        cleanedAnswer = cleanedAnswer.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
      }
      
      try {
        parsedData = JSON.parse(cleanedAnswer);
        setAnalysisData(parsedData);
        setError(null);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        setError('Failed to parse PII analysis data as JSON');
      }
    } catch (err) {
      console.error('Error processing PII analysis:', err);
      setError(`Failed to process PII analysis: ${err.message}`);
    }
  }, [result]);

  const copyToClipboard = (text, itemId) => {
    const textToCopy = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const downloadAnalysis = () => {
    if (!analysisData) return;
    
    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pii_redacted_analysis_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      dashboard: '📊',
      reporting: '📈',
      integrations: '🔗',
      mobile_app: '📱',
      additional_features: '✨'
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category) => {
    const colors = {
      dashboard: 'blue',
      reporting: 'purple',
      integrations: 'green',
      mobile_app: 'orange',
      additional_features: 'pink'
    };
    return colors[category] || 'gray';
  };

  const formatCategoryName = (category) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header with Security Badge */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              PII-Redacted Call Analysis
              <span className="text-xs font-semibold px-2 py-1 bg-green-200 text-green-800 rounded-full">
                🔒 SECURE
              </span>
            </h3>
            <p className="text-sm text-gray-600">All personally identifiable information removed</p>
          </div>
        </div>
        
        {analysisData && (
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(analysisData, 'analysis')}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Copy analysis JSON"
            >
              <Copy className="w-4 h-4" />
              {copiedItem === 'analysis' ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={downloadAnalysis}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Download analysis"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-2">Analysis Generation Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Content */}
      {!error && analysisData && analysisData.call_summary && (
        <div className="space-y-6">
          {/* CSR Information */}
          {analysisData.call_summary.csr_name && (
            <div className="bg-white p-6 rounded-xl border-2 border-indigo-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-6 h-6 text-indigo-600" />
                <h4 className="text-xl font-bold text-gray-900">CSR Information</h4>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Representative:</span>
                  <span className="text-lg font-bold text-indigo-600">{analysisData.call_summary.csr_name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Feedback by Category */}
          {analysisData.call_summary.customer_feedback && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-gray-700" />
                <h4 className="text-xl font-bold text-gray-900">Customer Feedback</h4>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Customer identity protected
                </span>
              </div>

              {/* Feedback Categories */}
              <div className="grid gap-4">
                {Object.entries(analysisData.call_summary.customer_feedback).map(([category, data]) => {
                  // Handle both array formats and object formats
                  const requests = Array.isArray(data) ? data : data.requests || [];
                  
                  if (requests.length === 0) return null;
                  
                  const color = getCategoryColor(category);
                  
                  return (
                    <div 
                      key={category}
                      className={`bg-white p-6 rounded-xl border-2 border-${color}-200 shadow-lg`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{getCategoryIcon(category)}</span>
                          <h5 className="text-lg font-bold text-gray-900">{formatCategoryName(category)}</h5>
                          <span className={`text-xs font-semibold px-2 py-1 bg-${color}-100 text-${color}-700 rounded-full`}>
                            {requests.length} request{requests.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(requests, `category-${category}`)}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-all"
                          title="Copy requests"
                        >
                          <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className={`p-4 bg-${color}-50 rounded-lg border border-${color}-200`}>
                        <ul className="space-y-2">
                          {requests.map((request, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className={`w-4 h-4 text-${color}-600 flex-shrink-0 mt-0.5`} />
                              <span className="text-sm text-gray-700">{request}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CSR Response */}
          {analysisData.call_summary.csr_response && (
            <div className="bg-white p-6 rounded-xl border-2 border-teal-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-teal-600" />
                  <h4 className="text-xl font-bold text-gray-900">CSR Response</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(analysisData.call_summary.csr_response, 'csr-response')}
                  className="p-2 rounded-lg hover:bg-teal-50 transition-all"
                  title="Copy response"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                <p className="text-sm text-gray-700">{analysisData.call_summary.csr_response}</p>
              </div>
            </div>
          )}

          {/* Security Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">🔒 Privacy & Security</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-xs text-gray-600">PII Removed</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="text-2xl mb-1">🔐</div>
                <div className="text-xs text-gray-600">Data Protected</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="text-2xl mb-1">📋</div>
                <div className="text-xs text-gray-600">Structured Summary</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-800 text-center">
                <strong>Privacy Compliant:</strong> All customer-identifiable information has been securely redacted from this analysis
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

