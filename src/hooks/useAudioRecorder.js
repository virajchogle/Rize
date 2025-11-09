import { useState, useRef } from 'react';
import { DualAudioRecorder } from '../services/audioRecorder';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const audioStreamRef = useRef(null); // Store the audio stream for transcription

  const startRecording = async (micDeviceId = null, onSystemAudioPrompt = null) => {
    try {
      recorderRef.current = new DualAudioRecorder();
      const result = await recorderRef.current.startRecording(micDeviceId, onSystemAudioPrompt);
      
      // Store the audio stream for transcription
      audioStreamRef.current = result.audioStream;
      
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(pausedTimeRef.current);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      return result; // Returns { hasSystemAudio: true/false, audioStream: MediaStream }
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const pauseRecording = () => {
    if (recorderRef.current && recorderRef.current.mediaRecorder) {
      if (recorderRef.current.mediaRecorder.state === 'recording') {
        recorderRef.current.mediaRecorder.pause();
        setIsPaused(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }
  };

  const resumeRecording = () => {
    if (recorderRef.current && recorderRef.current.mediaRecorder) {
      if (recorderRef.current.mediaRecorder.state === 'paused') {
        recorderRef.current.mediaRecorder.resume();
        setIsPaused(false);
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      }
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const audioBlob = await recorderRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      pausedTimeRef.current = 0;
      setRecordingTime(0);
      audioStreamRef.current = null; // Clear the audio stream
      
      return audioBlob;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  };

  return {
    isRecording,
    isPaused,
    recordingTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    getAudioStream: () => audioStreamRef.current // Get the current audio stream
  };
}

