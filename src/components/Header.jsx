import { Sun, ArrowLeft } from 'lucide-react';

export default function Header({ onBack, showBack = false }) {
  return (
    <div className="text-center mb-10 relative">
      {showBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors absolute top-0 left-0"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      )}
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl mb-4 shadow-lg shadow-orange-500/20">
        <Sun className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Rize</h1>
      <p className="text-gray-600 text-lg max-w-2xl mx-auto">
        Record your calls, generate transcripts, and get intelligent insights with AI-powered analysis.
      </p>
    </div>
  );
}

