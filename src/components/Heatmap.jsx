import { useEffect, useState } from 'react';
import { Map, Download, Copy } from 'lucide-react';

export default function Heatmap({ result }) {
  const [error, setError] = useState(null);
  const [scriptContent, setScriptContent] = useState('');
  const [heatmapData, setHeatmapData] = useState(null);

  useEffect(() => {
    if (!result || !result.rawResponse) {
      setError('No data available for heatmap');
      return;
    }

    try {
      // Extract data from rawResponse.answer
      const answer = result.rawResponse.answer || '';
      
      if (!answer) {
        setError('No heatmap data in response');
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
        setHeatmapData(parsedData);
        setScriptContent(JSON.stringify(parsedData, null, 2));
        setError(null);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        setError('Failed to parse heatmap data as JSON');
      }
    } catch (err) {
      console.error('Error processing heatmap:', err);
      setError(`Failed to process heatmap: ${err.message}`);
    }
  }, [result]);

  const downloadHeatmap = () => {
    if (!scriptContent) return;
    
    const blob = new Blob([scriptContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(scriptContent);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Talk Track Heatmap</h3>
            <p className="text-sm text-gray-600">Interactive visualization of call patterns</p>
          </div>
        </div>
        
        {scriptContent && (
          <div className="flex gap-2">
            <button
              onClick={copyScript}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Copy JSON data"
            >
              <Copy className="w-4 h-4" />
              Copy JSON
            </button>
            <button
              onClick={downloadHeatmap}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Download heatmap"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="space-y-3">
          <div className="p-6 bg-red-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-2">Heatmap Visualization Failed</h4>
                <p className="text-sm text-red-800 mb-3">
                  {error}
                </p>
                
                {result.rawResponse?.variables?.['javascriptSandbox.error'] === 'true' && (
                  <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                    <p className="text-sm text-red-900 font-semibold mb-1">
                      🔴 Backend Connection Error
                    </p>
                    <p className="text-sm text-red-800 mb-2">
                      {result.rawResponse.variables['javascriptSandbox.errormessage']}
                    </p>
                    <div className="text-xs text-red-700 bg-white p-3 rounded border border-red-200">
                      <p className="font-semibold mb-2">💡 Troubleshooting Steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Make sure your backend server is running on port 3001</li>
                        <li>Check that the heatmap_agent is properly configured in NeuralSeek</li>
                        <li>Verify the agent has access to generate chart data</li>
                        <li>Review backend logs for additional error details</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Show analysis text if available */}
          {result.rawResponse?.variables?.analysis && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Text Analysis</h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {result.rawResponse.variables.analysis}
              </p>
            </div>
          )}
          
          {/* Show raw HTML/Script */}
          {result.rawResponse?.answer && (
            <details className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-gray-700">
                View Generated HTML/Script
              </summary>
              <pre className="mt-3 p-3 bg-white rounded text-xs overflow-auto max-h-96 border border-gray-200">
                {result.rawResponse.answer}
              </pre>
            </details>
          )}
          
          {/* Debug Info */}
          <details className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-gray-700">
              View Full Response (Debug)
            </summary>
            <pre className="mt-3 p-3 bg-white rounded text-xs overflow-auto max-h-96 border border-gray-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Heatmap Data Visualization */}
      {!error && heatmapData && (
        <div className="space-y-6">
          {/* Topics Section */}
          {heatmapData.topics && heatmapData.topics.length > 0 && (
            <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Recurring Topics
              </h4>
              <div className="space-y-3">
                {heatmapData.topics.map((topic, idx) => {
                  const maxCount = Math.max(...heatmapData.topics.map(t => t.count));
                  const percentage = (topic.count / maxCount) * 100;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{topic.name}</span>
                        <span className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                          {topic.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 group-hover:from-orange-600 group-hover:to-red-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Objections Section */}
          {heatmapData.objections && heatmapData.objections.length > 0 && (
            <div className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Objections
              </h4>
              <div className="space-y-3">
                {heatmapData.objections.map((objection, idx) => {
                  const maxCount = Math.max(...heatmapData.objections.map(o => o.count));
                  const percentage = (objection.count / maxCount) * 100;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{objection.name}</span>
                        <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                          {objection.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500 group-hover:from-red-600 group-hover:to-pink-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {heatmapData.objections.length === 0 && (
                <p className="text-gray-500 text-sm italic">No objections detected in this call</p>
              )}
            </div>
          )}

          {/* Value Propositions Section */}
          {heatmapData.valuePropositions && heatmapData.valuePropositions.length > 0 && (
            <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💎</span>
                Value Propositions
              </h4>
              <div className="space-y-3">
                {heatmapData.valuePropositions.map((vp, idx) => {
                  const maxCount = Math.max(...heatmapData.valuePropositions.map(v => v.count));
                  const percentage = (vp.count / maxCount) * 100;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800">{vp.name}</span>
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          {vp.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 group-hover:from-green-600 group-hover:to-emerald-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📈 Summary Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border-2 border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{heatmapData.topics?.length || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Topics</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-red-200">
                <div className="text-3xl font-bold text-red-600">{heatmapData.objections?.length || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Objections</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="text-3xl font-bold text-green-600">{heatmapData.valuePropositions?.length || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Value Props</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

