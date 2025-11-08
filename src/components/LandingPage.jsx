import { Sun, Phone, Calculator, ArrowRight } from 'lucide-react';

export default function LandingPage({ onSelectApp }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Logo and Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl mb-6 shadow-xl shadow-orange-500/30">
            <Sun className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Rize</h1>
          <p className="text-gray-600 text-lg">Choose an app to get started</p>
        </div>

        {/* App Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Call Recording App */}
          <button
            onClick={() => onSelectApp('call-recording')}
            className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 hover:shadow-xl transition-all transform hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Transcription</h2>
            <p className="text-gray-600 mb-4">
              Record calls, get real-time transcripts, and generate AI-powered insights with automatic follow-up emails.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">Real-time</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">AI Analysis</span>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">Auto Email</span>
            </div>
          </button>

          {/* Tax Finder App */}
          <button
            onClick={() => onSelectApp('tax-finder')}
            className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-500 hover:shadow-xl transition-all transform hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tax Finder</h2>
            <p className="text-gray-600 mb-4">
              Enter your address to find applicable tax rates and calculate your tax obligations quickly and accurately.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">Location-based</span>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">Accurate</span>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">Fast</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Powered by NeuralSeek AI • Secure & Confidential
          </p>
        </div>
      </div>
    </div>
  );
}

