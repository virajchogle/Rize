/**
 * NeuralSeek API Integration via Backend Proxy
 */

// Use backend proxy in development, Vercel function in production
// In production (Vercel), use relative path to serverless function
// In development, use localhost backend or override with VITE_API_URL
const getApiUrl = () => {
  // If explicitly set, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api/analyze';
  }
  
  // Otherwise, use relative path (works with Vercel serverless function)
  return '/api/analyze';
};

const API_URL = getApiUrl();

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

