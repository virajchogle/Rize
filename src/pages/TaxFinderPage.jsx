import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import TaxFinder from '../components/TaxFinder';
import { analyzeFeature } from '../services/featureAPI';

export default function TaxFinderPage({ onBack }) {
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTaxLookup = async (address) => {
    setIsProcessing(true);
    try {
      const data = await analyzeFeature('tax-finder', address);
      setResult(data);
    } catch (err) {
      console.error('Tax lookup error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* TaxFinder Component */}
        <TaxFinder result={result} onLookup={handleTaxLookup} />
      </div>
    </div>
  );
}

