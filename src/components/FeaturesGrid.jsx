import {
  Award,
  BarChart3,
  Calculator,
  FileText,
  LineChart,
  Mail,
  Map,
  Shield,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    id: "summarize",
    title: "Summarize",
    description:
      "Get a concise summary of your call transcript with key highlights and main points.",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    iconColor: "text-blue-600",
  },
  {
    id: "generate-email",
    title: "Generate Email",
    description:
      "Automatically create professional follow-up emails based on your call transcript.",
    icon: Mail,
    color: "from-green-500 to-emerald-600",
    iconColor: "text-green-600",
  },
  {
    id: "heatmap",
    title: "Talk Track Heatmap",
    description:
      "Visual heatmap showing recurring topics, objections, and value propositions across multiple calls.",
    icon: Map,
    color: "from-orange-500 to-orange-600",
    iconColor: "text-orange-600",
  },
  {
    id: "feature-requests",
    title: "Feature Highrequest",
    description:
      "Extract and quantify product feature requests and enhancement discussions from call transcripts.",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600",
    iconColor: "text-purple-600",
  },
  {
    id: "call-dashboard",
    title: "Single Call Review",
    description:
      "Interactive dashboard with call summary, sentiment timeline, and topic heatmap for individual calls.",
    icon: BarChart3,
    color: "from-indigo-500 to-indigo-600",
    iconColor: "text-indigo-600",
  },
  {
    id: "call-scoring",
    title: "Call Scoring",
    description:
      "Performance score with talk-to-listen ratio, sentiment analysis, and targeted coaching suggestions.",
    icon: Award,
    color: "from-yellow-500 to-yellow-600",
    iconColor: "text-yellow-600",
  },
  {
    id: "pipeline-analyzer",
    title: "Pipeline Momentum",
    description:
      "Analyze deal activity patterns, velocity metrics, and identify risks in your sales pipeline.",
    icon: LineChart,
    color: "from-cyan-500 to-cyan-600",
    iconColor: "text-cyan-600",
  },
  {
    id: "pii-wipe",
    title: "PII Wipe & Analyze",
    description:
      "Secure analysis with automatic PII redaction before processing call transcripts through AI.",
    icon: Shield,
    color: "from-red-500 to-red-600",
    iconColor: "text-red-600",
  },
  {
    id: "tax-finder",
    title: "Tax Finder",
    description:
      "Look up comprehensive tax rates (state, county, city, school district) for any US address.",
    icon: Calculator,
    color: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-600",
  },
];

export default function FeaturesGrid({ onFeatureSelect, transcript }) {
  const handleFeatureClick = (feature) => {
    // Pipeline analyzer and tax finder don't require a transcript
    if (feature.id === "pipeline-analyzer" || feature.id === "tax-finder") {
      onFeatureSelect(feature);
      return;
    }

    if (!transcript.trim()) {
      alert("Please provide a transcript first");
      return;
    }
    onFeatureSelect(feature);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Features
        </h2>
        <p className="text-gray-600">
          Select a feature to analyze your call transcript
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isAvailable =
            transcript.trim() ||
            feature.id === "pipeline-analyzer" ||
            feature.id === "tax-finder";

          return (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              disabled={!isAvailable}
              className={`
                relative bg-white border-2 rounded-xl p-6 text-left transition-all transform hover:scale-105 active:scale-95
                border-gray-200 hover:border-gray-300 hover:shadow-md
                ${
                  !isAvailable
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }
              `}
            >
              {feature.id === "pipeline-analyzer" && !transcript.trim() && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    CSV Upload
                  </span>
                </div>
              )}
              {feature.id === "tax-finder" && !transcript.trim() && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Address Input
                  </span>
                </div>
              )}

              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-gray-100">
                <Icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 text-base">
                {feature.title}
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </button>
          );
        })}
      </div>

      {!transcript.trim() && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 <strong>Tip:</strong> Record a call or paste a transcript above
            to use most features.
            <span className="font-medium text-green-700">
              {" "}
              Pipeline Momentum
            </span>{" "}
            (CSV upload) and
            <span className="font-medium text-emerald-700">
              {" "}
              Tax Finder
            </span>{" "}
            (address lookup) can be used without a transcript.
          </p>
        </div>
      )}
    </div>
  );
}
