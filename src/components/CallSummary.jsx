import { FileText, CheckCircle2 } from 'lucide-react';

export default function CallSummary({ result }) {
  if (!result) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-center">No summary data available</p>
      </div>
    );
  }

  const hasSummary = result.summary;
  const hasKeyPoints = result.keyPoints && result.keyPoints.length > 0;
  const hasActionItems = result.actionItems && result.actionItems.length > 0;
  const hasAnyData = hasSummary || hasKeyPoints || hasActionItems;

  if (!hasAnyData) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
          <h4 className="font-bold text-yellow-900 mb-2">⚠️ No Structured Data Found</h4>
          <p className="text-sm text-yellow-800 mb-3">
            The API returned a response, but it doesn't contain the expected fields (summary, keyPoints, actionItems).
          </p>
          <details className="mt-2">
            <summary className="text-xs text-yellow-700 cursor-pointer hover:text-yellow-900 font-medium">
              🔍 View Raw Response (for debugging)
            </summary>
            <div className="mt-2 p-3 bg-white rounded border border-yellow-200 max-h-96 overflow-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        </div>
        
        {result.text && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3">Raw Response Text</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.text}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      {hasSummary && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Summary</h3>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
        </div>
      )}

      {/* Key Points Section */}
      {hasKeyPoints && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <h3 className="font-semibold text-gray-900 mb-3">Key Points</h3>
          <ul className="space-y-2">
            {result.keyPoints.map((point, idx) => {
              // Check if it's a header (starts with ** and ends with **)
              const isHeader = point.startsWith('**') && point.includes(':**');
              
              if (isHeader) {
                // Extract the text between ** markers
                const headerText = point.replace(/\*\*/g, '');
                return (
                  <li key={idx} className="mt-3 first:mt-0">
                    <h4 className="font-bold text-green-900 text-base">{headerText}</h4>
                  </li>
                );
              }
              
              return (
                <li key={idx} className="flex items-start gap-2 ml-4">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></span>
                  <span className="text-gray-700 flex-1">{point}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Action Items Section */}
      {hasActionItems && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Action Items</h3>
          </div>
          <ul className="space-y-2">
            {result.actionItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-200 text-orange-900 text-xs font-bold flex items-center justify-center mt-0.5">
                  ✓
                </span>
                <span className="text-gray-700 flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

