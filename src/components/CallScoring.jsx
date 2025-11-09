import { useEffect, useState } from 'react';
import { Award, TrendingUp, AlertCircle, Lightbulb, Download, Copy, Star } from 'lucide-react';

export default function CallScoring({ result }) {
  const [error, setError] = useState(null);
  const [scoringData, setScoringData] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);

  useEffect(() => {
    if (!result || !result.rawResponse) {
      setError('No data available for call scoring');
      return;
    }

    try {
      // Extract data from rawResponse.answer
      const answer = result.rawResponse.answer || '';
      
      if (!answer) {
        setError('No scoring data in response');
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
        setScoringData(parsedData);
        setError(null);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        setError('Failed to parse scoring data as JSON');
      }
    } catch (err) {
      console.error('Error processing scoring:', err);
      setError(`Failed to process scoring: ${err.message}`);
    }
  }, [result]);

  const copyToClipboard = (text, itemId) => {
    const textToCopy = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const downloadScoring = () => {
    if (!scoringData) return;
    
    const blob = new Blob([JSON.stringify(scoringData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call_scoring_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score) => {
    if (score >= 9) return 'text-green-600 from-green-500 to-emerald-500';
    if (score >= 7) return 'text-blue-600 from-blue-500 to-cyan-500';
    if (score >= 5) return 'text-yellow-600 from-yellow-500 to-orange-500';
    return 'text-red-600 from-red-500 to-pink-500';
  };

  const getScoreGrade = (score) => {
    if (score >= 9) return { grade: 'A+', emoji: '🌟', message: 'Outstanding!' };
    if (score >= 8) return { grade: 'A', emoji: '⭐', message: 'Excellent' };
    if (score >= 7) return { grade: 'B+', emoji: '👍', message: 'Very Good' };
    if (score >= 6) return { grade: 'B', emoji: '✓', message: 'Good' };
    if (score >= 5) return { grade: 'C', emoji: '→', message: 'Average' };
    return { grade: 'D', emoji: '⚠️', message: 'Needs Improvement' };
  };

  const getScorePercentage = (score) => {
    return (score / 10) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border-2 border-amber-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Call Performance Scoring</h3>
            <p className="text-sm text-gray-600">Comprehensive call evaluation & coaching</p>
          </div>
        </div>
        
        {scoringData && (
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(scoringData, 'scoring')}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Copy scoring JSON"
            >
              <Copy className="w-4 h-4" />
              {copiedItem === 'scoring' ? 'Copied!' : 'Copy JSON'}
            </button>
            <button
              onClick={downloadScoring}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Download scoring"
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
              <h4 className="font-bold text-red-900 mb-2">Scoring Generation Failed</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Content */}
      {!error && scoringData && (
        <div className="space-y-6">
          {/* Score Display */}
          {scoringData.score !== undefined && (
            <div className="bg-white p-8 rounded-xl border-2 border-amber-200 shadow-lg">
              <div className="flex items-center justify-between">
                {/* Score Circle */}
                <div className="flex items-center gap-8">
                  <div className="relative">
                    {/* Background Circle */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Progress Circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#scoreGradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - getScorePercentage(scoringData.score) / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className={getScoreColor(scoringData.score).split(' ')[1]} />
                          <stop offset="100%" className={getScoreColor(scoringData.score).split(' ')[2]} />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Score Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getScoreColor(scoringData.score).split(' ')[0]}`}>
                          {scoringData.score}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">out of 10</div>
                      </div>
                    </div>
                  </div>

                  {/* Grade & Message */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-6xl">{getScoreGrade(scoringData.score).emoji}</span>
                      <div>
                        <div className="text-5xl font-bold text-gray-900">
                          {getScoreGrade(scoringData.score).grade}
                        </div>
                        <div className="text-lg text-gray-600 font-medium">
                          {getScoreGrade(scoringData.score).message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-col gap-2">
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-2xl font-bold text-amber-600">
                      {getScorePercentage(scoringData.score).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Performance</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <Star className={`w-3 h-3 ${scoringData.score >= 8 ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Justification */}
          {scoringData.justification && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {scoringData.justification.strengths && (
                <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Strengths</h4>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {scoringData.justification.strengths}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(scoringData.justification.strengths, 'strengths')}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedItem === 'strengths' ? 'Copied!' : 'Copy Strengths'}
                  </button>
                </div>
              )}

              {/* Weaknesses */}
              {scoringData.justification.weaknesses && (
                <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Areas for Improvement</h4>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {scoringData.justification.weaknesses}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(scoringData.justification.weaknesses, 'weaknesses')}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 transition-all"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedItem === 'weaknesses' ? 'Copied!' : 'Copy Improvements'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Coaching Suggestions */}
          {scoringData.coachingSuggestions && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Coaching Suggestions</h4>
              </div>
              <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {scoringData.coachingSuggestions}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(scoringData.coachingSuggestions, 'coaching')}
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 transition-all"
              >
                <Copy className="w-3 h-3" />
                {copiedItem === 'coaching' ? 'Copied!' : 'Copy Coaching Tips'}
              </button>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Scoring Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border-2 border-amber-200">
                <div className="text-3xl font-bold text-amber-600">{scoringData.score}/10</div>
                <div className="text-xs text-gray-600 mt-1">Overall Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="text-2xl mb-1">✓</div>
                <div className="text-xs text-gray-600">Strengths Noted</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="text-2xl mb-1">💡</div>
                <div className="text-xs text-gray-600">Coaching Available</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

