import { useEffect, useState } from 'react';
import { Trophy, Users, Target, Lightbulb, Download, Copy, TrendingUp } from 'lucide-react';

export default function FeedbackReport({ result }) {
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    if (!result || !result.rawResponse) {
      setError('No data available for feedback report');
      return;
    }

    try {
      // Extract data from rawResponse.answer
      const answer = result.rawResponse.answer || '';
      
      if (!answer) {
        setError('No feedback report data in response');
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
        setReportData(parsedData);
        setError(null);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        setError('Failed to parse feedback report data as JSON');
      }
    } catch (err) {
      console.error('Error processing feedback report:', err);
      setError(`Failed to process feedback report: ${err.message}`);
    }
  }, [result]);

  const copyToClipboard = (text, itemId) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-purple-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Feedback Report</h3>
            <p className="text-sm text-gray-600">Feature Request Leaderboard & Analysis</p>
          </div>
        </div>
        
        {reportData && (
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(JSON.stringify(reportData, null, 2), 'report')}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Copy report JSON"
            >
              <Copy className="w-4 h-4" />
              {copiedItem === 'report' ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Download report"
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
              <h4 className="font-bold text-red-900 mb-2">Report Generation Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Report */}
      {!error && reportData && (
        <div className="space-y-6">
          {/* Feature Request Leaderboard */}
          {reportData.feature_request_leaderboard && reportData.feature_request_leaderboard.length > 0 && (
            <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-purple-600" />
                <h4 className="text-xl font-bold text-gray-900">Feature Request Leaderboard</h4>
              </div>
              
              <div className="space-y-3">
                {reportData.feature_request_leaderboard.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-xl font-bold text-purple-600">
                      {getMedalEmoji(idx)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.feature_request}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{item.frequency}</div>
                        <div className="text-xs text-gray-500">mentions</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.feature_request, `item-${idx}`)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white transition-all"
                        title="Copy feature request"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Segment Analysis */}
          {reportData.customer_segment_analysis && (
            <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-blue-600" />
                <h4 className="text-xl font-bold text-gray-900">Customer Segment Analysis</h4>
              </div>
              
              <div className="grid gap-4">
                {Object.entries(reportData.customer_segment_analysis).map(([key, segment], idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                    <h5 className="font-bold text-blue-900 mb-2 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h5>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Description:</strong> {segment.description}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Implication:</strong> {segment.implication}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Tier Analysis */}
          {reportData.account_tier_analysis && (
            <div className="bg-white p-6 rounded-xl border-2 border-emerald-200 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-emerald-600" />
                <h4 className="text-xl font-bold text-gray-900">Account Tier Analysis</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50 border-2 border-emerald-200">
                  <div>
                    <span className="text-sm text-gray-600">Potential Tier</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">
                      {reportData.account_tier_analysis.potential_tier}
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
                
                <div className="p-4 rounded-lg bg-emerald-50">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Description:</strong> {reportData.account_tier_analysis.description}
                  </p>
                  <p className="text-sm text-emerald-800">
                    <strong>Implication:</strong> {reportData.account_tier_analysis.implication}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary & Insights */}
          {reportData.summary && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-6 h-6 text-amber-600" />
                <h4 className="text-xl font-bold text-gray-900">Insights & Recommendations</h4>
              </div>
              
              {/* Insights */}
              {reportData.summary.insights && (
                <div className="mb-6 p-4 bg-white rounded-lg border-2 border-amber-200">
                  <h5 className="font-bold text-amber-900 mb-2">💡 Key Insights</h5>
                  <p className="text-sm text-gray-700">{reportData.summary.insights}</p>
                </div>
              )}
              
              {/* Recommendations */}
              {reportData.summary.recommendations && reportData.summary.recommendations.length > 0 && (
                <div className="p-4 bg-white rounded-lg border-2 border-amber-200">
                  <h5 className="font-bold text-amber-900 mb-3">🎯 Recommendations</h5>
                  <ul className="space-y-2">
                    {reportData.summary.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-gray-700 flex-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Stats Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Report Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="text-3xl font-bold text-purple-600">
                  {reportData.feature_request_leaderboard?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Feature Requests</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="text-3xl font-bold text-blue-600">
                  {Object.keys(reportData.customer_segment_analysis || {}).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Customer Segments</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-emerald-200">
                <div className="text-3xl font-bold text-emerald-600">
                  {reportData.summary?.recommendations?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Recommendations</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

