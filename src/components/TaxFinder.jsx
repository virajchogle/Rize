import { useState } from 'react';
import { MapPin, Search, Copy, CheckCircle2 } from 'lucide-react';

export default function TaxFinder({ result, onLookup }) {
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLookup = async () => {
    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }

    setIsProcessing(true);
    try {
      await onLookup(address);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = result?.rawResponse?.answer || result?.rawResponse?.variables?.summary || result?.text || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get the raw text from the response
  const rawText = result?.rawResponse?.answer || result?.rawResponse?.variables?.summary || result?.text || '';

  // Simple markdown renderer
  const renderMarkdown = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let listItems = [];

    lines.forEach((line, index) => {
      // Handle headers
      if (line.startsWith('### ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 ml-4 mb-4">{listItems}</ul>);
          listItems = [];
        }
        elements.push(
          <h3 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 ml-4 mb-4">{listItems}</ul>);
          listItems = [];
        }
        elements.push(
          <h4 key={index} className="text-xl font-semibold text-blue-800 mt-5 mb-2">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Handle list items
      else if (line.trim().startsWith('- ')) {
        const content = line.trim().substring(2);
        // Parse bold text within list items
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const renderedContent = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        });
        listItems.push(
          <li key={index} className="text-gray-700 leading-relaxed ml-4">
            {renderedContent}
          </li>
        );
      }
      // Handle empty lines (close any open lists)
      else if (line.trim() === '') {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 ml-4 mb-4">{listItems}</ul>);
          listItems = [];
        }
        elements.push(<div key={index} className="h-2" />);
      }
      // Handle regular paragraphs with bold text
      else if (line.trim()) {
        if (listItems.length > 0) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 ml-4 mb-4">{listItems}</ul>);
          listItems = [];
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const renderedContent = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        });
        elements.push(
          <p key={index} className="text-gray-700 leading-relaxed mb-3">
            {renderedContent}
          </p>
        );
      }
    });

    // Close any remaining open lists
    if (listItems.length > 0) {
      elements.push(<ul key="list-final" className="list-disc list-inside space-y-2 ml-4 mb-4">{listItems}</ul>);
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xl">Tax Rate Finder</h3>
            <p className="text-sm text-gray-600">Look up comprehensive tax rates for any US address</p>
          </div>
        </div>

        {/* Address Input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="Enter full address (e.g., 123 Main St, Los Angeles, CA 90001)"
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-700"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={isProcessing || !address.trim()}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              isProcessing || !address.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Looking up...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Look Up
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tax Results - Rendered Markdown */}
      {rawText && (
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-900">Tax Information</h4>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md"
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
            <div className="prose prose-blue max-w-none">
              {renderMarkdown(rawText)}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {result && !rawText && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
          <h4 className="font-bold text-yellow-900 mb-2">⚠️ No Tax Data Found</h4>
          <p className="text-sm text-yellow-800 mb-3">
            The API returned a response, but no text data was found.
          </p>
          <details className="mt-3">
            <summary className="text-xs text-yellow-700 cursor-pointer hover:text-yellow-900 font-medium">
              🔍 View Raw Response
            </summary>
            <div className="mt-2 p-3 bg-white rounded border border-yellow-200 max-h-96 overflow-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* Instructions */}
      {!result && !isProcessing && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">How to Use</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Enter a complete US address including street, city, state, and ZIP code</li>
                <li>Get comprehensive tax information including state, county, city, school district, and special district taxes</li>
                <li>Perfect for sales tax calculations, real estate analysis, and financial planning</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
