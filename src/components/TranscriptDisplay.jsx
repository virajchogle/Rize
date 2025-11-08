import { Download, Trash2, FileText } from 'lucide-react';

export default function TranscriptDisplay({ transcript, onTranscriptChange }) {
  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the transcript?')) {
      onTranscriptChange('');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Transcript</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-gray-700"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
      
      <textarea
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 leading-relaxed"
        placeholder="Transcript will appear here as you speak..."
      />
      <p className="text-xs text-gray-500 mt-2">
        {transcript.split(/\s+/).filter(word => word.length > 0).length} words
      </p>
    </div>
  );
}

