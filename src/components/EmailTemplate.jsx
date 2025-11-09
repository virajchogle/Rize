import { Mail, Copy, CheckCircle2, Send } from 'lucide-react';
import { useState } from 'react';

export default function EmailTemplate({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-500 text-center">No email data available</p>
      </div>
    );
  }

  const hasEmailData = result.emailSubject || result.emailBody || result.emailTo;

  if (!hasEmailData) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-xl">
          <h4 className="font-bold text-yellow-900 mb-2">⚠️ No Email Data Found</h4>
          <p className="text-sm text-yellow-800 mb-3">
            The API returned a response, but it doesn't contain email data.
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
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyFullEmail = () => {
    const fullEmail = `To: ${result.emailTo || '(Not specified)'}
Subject: ${result.emailSubject || '(No subject)'}

${result.emailBody || ''}`;
    copyToClipboard(fullEmail);
  };

  return (
    <div className="space-y-4">
      {/* Email Header */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900 text-lg">Follow-up Email</h3>
          </div>
          <button
            onClick={copyFullEmail}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
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
                Copy Email
              </>
            )}
          </button>
        </div>

        {/* Email To */}
        {result.emailTo && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase">To:</span>
              <span className="text-sm text-gray-900 font-medium">{result.emailTo}</span>
            </div>
          </div>
        )}

        {/* Email Subject */}
        {result.emailSubject && (
          <div className="mb-3 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-gray-600 uppercase block mb-1">Subject:</span>
                <span className="text-sm text-gray-900 font-medium">{result.emailSubject}</span>
              </div>
            </div>
          </div>
        )}

        {/* Email Body */}
        {result.emailBody && (
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-start gap-2 mb-3">
              <div className="w-4 h-4 text-green-600 mt-0.5">📄</div>
              <span className="text-xs font-semibold text-gray-600 uppercase">Body:</span>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {result.emailBody}
            </div>
          </div>
        )}
      </div>

      {/* Email Preview Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Pro Tip</h4>
        <p className="text-xs text-blue-800">
          Review the email content and customize it as needed before sending. 
          Remember to replace placeholder text like [Customer's Name] with actual information.
        </p>
      </div>
    </div>
  );
}
