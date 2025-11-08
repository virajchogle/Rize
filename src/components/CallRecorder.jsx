import { useEffect } from 'react';
import { Mic, Square, Radio, Pause, Play } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function CallRecorder({ onTranscriptUpdate }) {
  const { isRecording, isPaused, recordingTime, startRecording, pauseRecording, resumeRecording, stopRecording } = useAudioRecorder();
  const { transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();

  // Update transcript in real-time
  useEffect(() => {
    if (isRecording && transcript) {
      onTranscriptUpdate?.(transcript);
    }
  }, [transcript, isRecording, onTranscriptUpdate]);

  const handleStart = async () => {
    try {
      // Clear previous transcript
      setTranscript('');
      await startRecording();
      startListening();
    } catch (error) {
      alert('Failed to start recording. Please allow microphone access.');
    }
  };

  const handlePause = () => {
    pauseRecording();
    stopListening();
  };

  const handleResume = () => {
    resumeRecording();
    startListening();
  };

  const handleStop = async () => {
    try {
      await stopRecording();
      stopListening();
      if (onTranscriptUpdate) {
        onTranscriptUpdate(transcript);
      }
    } catch (error) {
      alert('Failed to stop recording.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">Call Recording</h2>
      
      <div className="flex flex-col items-center gap-6">
        {(isRecording || isPaused) && (
          <div className="flex items-center gap-3">
            <div className="relative">
              {isPaused ? (
                <Radio className="w-6 h-6 text-yellow-500" />
              ) : (
                <>
                  <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                </>
              )}
            </div>
            <div className="text-3xl font-mono font-bold text-gray-900">
              {formatTime(recordingTime)}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!isRecording && !isPaused && (
            <button
              onClick={handleStart}
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/30"
            >
              <Mic className="w-6 h-6" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={handlePause}
                className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-yellow-500/30"
              >
                <Pause className="w-5 h-5" />
                Pause
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/30"
              >
                <Square className="w-5 h-5" />
                Stop
              </button>
            </>
          )}

          {isPaused && (
            <>
              <button
                onClick={handleResume}
                className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30"
              >
                <Play className="w-5 h-5" />
                Resume
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/30"
              >
                <Square className="w-5 h-5" />
                Stop
              </button>
            </>
          )}
        </div>

        {isRecording && !isPaused && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Recording in progress...
          </p>
        )}

        {isPaused && (
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Recording paused
          </p>
        )}
      </div>
    </div>
  );
}

