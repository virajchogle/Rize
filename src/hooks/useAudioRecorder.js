import { useState, useRef } from 'react';
import { DualAudioRecorder } from '../services/audioRecorder';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const pausedTimeRef = useRef(0);

  const startRecording = async (micDeviceId = null) => {
    try {
      recorderRef.current = new DualAudioRecorder();
      await recorderRef.current.startRecording(micDeviceId);
      
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(pausedTimeRef.current);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      return true;
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
    stopRecording
  };
}

