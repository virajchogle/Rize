import { useEffect, useState } from 'react';
import { Mic, Square, Radio, Pause, Play, Volume2, AlertCircle } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function CallRecorder({ onTranscriptUpdate }) {
  const { isRecording, isPaused, recordingTime, startRecording, pauseRecording, resumeRecording, stopRecording } = useAudioRecorder();
  const { transcript, isTranscribing, transcribeAudio, setTranscript } = useSpeechRecognition();
  const [showSystemAudioPrompt, setShowSystemAudioPrompt] = useState(false);
  const [hasSystemAudio, setHasSystemAudio] = useState(false);

  // Update transcript when it changes
  useEffect(() => {
    if (transcript) {
      onTranscriptUpdate?.(transcript);
    }
  }, [transcript, onTranscriptUpdate]);

  const handleStart = async () => {
    try {
      // Clear previous transcript
      setTranscript('');
      setShowSystemAudioPrompt(false);
      setHasSystemAudio(false);
      
      // Start recording with system audio prompt callback
      const result = await startRecording(null, () => {
        setShowSystemAudioPrompt(true);
      });
      
      // Check if system audio was captured
      if (result && result.hasSystemAudio) {
        setHasSystemAudio(true);
      }
      setShowSystemAudioPrompt(false);
    } catch (error) {
      setShowSystemAudioPrompt(false);
      if (error.message.includes('System audio')) {
        alert('⚠️ System audio is required to record calls.\n\nWhen prompted, please:\n1. Select "Entire Screen" or "Window"\n2. Make sure "Share audio" is checked/enabled\n3. Choose the window where your call is (Zoom, Google Meet, etc.)\n4. Click "Share"\n\nThis captures both your voice and the call audio.');
      } else {
        alert('Failed to start recording. Please allow microphone access.');
      }
    }
  };

  const handlePause = () => {
    pauseRecording();
  };

  const handleResume = () => {
    resumeRecording();
  };

  const handleStop = async () => {
    try {
      // Stop recording and get the audio blob
      const audioBlob = await stopRecording();
      
      // Transcribe the entire recording
      if (audioBlob && audioBlob.size > 0) {
        await transcribeAudio(audioBlob);
      } else {
        alert('No audio was recorded.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert(`Failed to process recording: ${error.message}`);
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

        {isTranscribing && (
          <p className="text-sm text-blue-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Transcribing recording... This may take a moment.
          </p>
        )}

        {/* System Audio Prompt */}
        {showSystemAudioPrompt && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Share System Audio
                </p>
                <p className="text-xs text-blue-700">
                  A browser prompt will appear. Please select <strong>"Entire Screen"</strong> or <strong>"Window"</strong> and make sure <strong>"Share audio"</strong> is enabled to capture call audio (the other person's voice from Zoom, Google Meet, etc.).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* System Audio Status */}
        {isRecording && hasSystemAudio && (
          <p className="text-xs text-green-600 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Recording: Your voice + Call audio
          </p>
        )}

        {/* Info Box */}
        {!isRecording && !isPaused && !isTranscribing && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Recording both sides of the call:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  <li>Your microphone (your voice)</li>
                  <li>System audio (call audio - other person's voice)</li>
                </ul>
                <p className="mt-2 text-gray-400">Works best in Chrome/Edge. Select "Entire Screen" or "Window" with audio enabled to capture Zoom/Meet calls. The transcript will be generated after you stop recording.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

