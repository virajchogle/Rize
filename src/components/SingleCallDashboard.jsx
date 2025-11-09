import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, FileText, CheckSquare, MessageSquare, Download, Copy } from 'lucide-react';

export default function SingleCallDashboard({ result }) {
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    if (!result || !result.rawResponse) {
      setError('No data available for call dashboard');
      return;
    }

    try {
      const variables = result.rawResponse.variables || {};
      
      // Parse JSON strings if they are stringified
      const parseIfJSON = (value) => {
        if (typeof value === 'string') {
          // Try to parse if it looks like JSON
          if (value.trim().startsWith('{') || value.trim().startsWith('[') || value.trim().startsWith('```json')) {
            let cleaned = value.trim();
            if (cleaned.startsWith('```json')) {
              cleaned = cleaned.replace(/^```json\n/, '').replace(/\n```$/, '').trim();
            } else if (cleaned.startsWith('```')) {
              cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
            }
            try {
              return JSON.parse(cleaned);
            } catch {
              return value;
            }
          }
        }
        return value;
      };

      const data = {
        callSummary: parseIfJSON(variables.callSummary),
        sentimentTimeline: parseIfJSON(variables.sentimentTimeline),
        topicHeatmap: parseIfJSON(variables.topicHeatmap),
        actionItems: parseIfJSON(variables.actionItems),
        talkListenRatio: parseIfJSON(variables.talkListenRatio)
      };

      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error processing dashboard:', err);
      setError(`Failed to process dashboard: ${err.message}`);
    }
  }, [result]);

  const copyToClipboard = (text, itemId) => {
    const textToCopy = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const downloadDashboard = () => {
    if (!dashboardData) return;
    
    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call_dashboard_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = (content) => {
    if (typeof content === 'string') {
      return <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>;
    } else if (Array.isArray(content)) {
      return (
        <ul className="space-y-2">
          {content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-900 text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="text-sm text-gray-700 flex-1">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </span>
            </li>
          ))}
        </ul>
      );
    } else if (typeof content === 'object' && content !== null) {
      return (
        <div className="space-y-3">
          {Object.entries(content).map(([key, value], idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-1 capitalize">{key.replace(/_/g, ' ')}</h5>
              <div className="text-sm text-gray-700">
                {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm text-gray-500 italic">No data available</p>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Single Call Review Dashboard</h3>
            <p className="text-sm text-gray-600">Comprehensive call analysis and insights</p>
          </div>
        </div>
        
        {dashboardData && (
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(dashboardData, 'dashboard')}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Copy dashboard JSON"
            >
              <Copy className="w-4 h-4" />
              {copiedItem === 'dashboard' ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={downloadDashboard}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Download dashboard"
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
              <h4 className="font-bold text-red-900 mb-2">Dashboard Generation Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {!error && dashboardData && (
        <div className="grid gap-6">
          {/* Call Summary */}
          {dashboardData.callSummary && (
            <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <h4 className="text-xl font-bold text-gray-900">Call Summary</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(dashboardData.callSummary, 'summary')}
                  className="p-2 rounded-lg hover:bg-blue-50 transition-all"
                  title="Copy summary"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                {renderContent(dashboardData.callSummary)}
              </div>
            </div>
          )}

          {/* Sentiment Timeline */}
          {dashboardData.sentimentTimeline && (
            <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h4 className="text-xl font-bold text-gray-900">Sentiment Timeline</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(dashboardData.sentimentTimeline, 'sentiment')}
                  className="p-2 rounded-lg hover:bg-purple-50 transition-all"
                  title="Copy sentiment timeline"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                {renderContent(dashboardData.sentimentTimeline)}
              </div>
            </div>
          )}

          {/* Topic Heatmap */}
          {dashboardData.topicHeatmap && (
            <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                  <h4 className="text-xl font-bold text-gray-900">Topic Heatmap</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(dashboardData.topicHeatmap, 'topics')}
                  className="p-2 rounded-lg hover:bg-orange-50 transition-all"
                  title="Copy topic heatmap"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                {renderContent(dashboardData.topicHeatmap)}
              </div>
            </div>
          )}

          {/* Action Items */}
          {dashboardData.actionItems && (
            <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                  <h4 className="text-xl font-bold text-gray-900">Action Items</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(dashboardData.actionItems, 'actions')}
                  className="p-2 rounded-lg hover:bg-green-50 transition-all"
                  title="Copy action items"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                {renderContent(dashboardData.actionItems)}
              </div>
            </div>
          )}

          {/* Talk-Listen Ratio */}
          {dashboardData.talkListenRatio && (
            <div className="bg-white p-6 rounded-xl border-2 border-cyan-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-cyan-600" />
                  <h4 className="text-xl font-bold text-gray-900">Talk-Listen Ratio</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(dashboardData.talkListenRatio, 'ratio')}
                  className="p-2 rounded-lg hover:bg-cyan-50 transition-all"
                  title="Copy talk-listen ratio"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                {renderContent(dashboardData.talkListenRatio)}
              </div>
            </div>
          )}

          {/* Dashboard Summary Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Dashboard Components</h4>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="text-2xl mb-1">📝</div>
                <div className="text-xs text-gray-600">Summary</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-xs text-gray-600">Sentiment</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-200">
                <div className="text-2xl mb-1">🗺️</div>
                <div className="text-xs text-gray-600">Topics</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="text-2xl mb-1">✅</div>
                <div className="text-xs text-gray-600">Actions</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-cyan-200">
                <div className="text-2xl mb-1">💬</div>
                <div className="text-xs text-gray-600">Ratio</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

