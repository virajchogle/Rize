import { useState } from 'react';
import { analyzeCallTranscript } from '../services/neuralSeekAPI';

export function useNeuralSeekAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (transcript, emailRecipients = '') => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeCallTranscript(transcript, emailRecipients);
      setAnalysis(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setError(null);
  };

  return {
    analysis,
    isAnalyzing,
    error,
    analyze,
    reset
  };
}

