/**
 * NeuralSeek API Integration via Backend Proxy
 */

// Use backend proxy in development, Vercel function in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/analyze';

/**
 * Analyze call transcript using NeuralSeek agent via proxy
 */
export async function analyzeCallTranscript(transcript, emailRecipients = '') {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: transcript,
        emailRecipients: emailRecipients
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('NeuralSeek API error:', error);
    throw error;
  }
}

