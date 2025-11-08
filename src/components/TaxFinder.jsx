import { Calculator, MapPin, Search, ArrowLeft } from 'lucide-react';

export default function TaxFinder({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4 shadow-lg shadow-green-500/20">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tax Finder</h1>
          <p className="text-gray-600 text-lg">
            Enter your address to find applicable tax rates
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="space-y-6">
            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Enter Your Address
              </label>
              <input
                type="text"
                placeholder="123 Main Street, City, State, ZIP Code"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Search Button */}
            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-98 shadow-lg shadow-green-500/30"
            >
              <Search className="w-5 h-5" />
              Find Tax Rates
            </button>

            {/* Placeholder Results */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 text-center">
                Enter an address above to see tax information
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Sales Tax</h3>
            <p className="text-sm text-gray-600">Find applicable sales tax rates for your location</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Property Tax</h3>
            <p className="text-sm text-gray-600">Calculate property tax based on your address</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Income Tax</h3>
            <p className="text-sm text-gray-600">Get state and local income tax information</p>
          </div>
        </div>
      </div>
    </div>
  );
}

