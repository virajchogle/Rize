/**
 * NeuralSeek API Integration via Backend Proxy
 */

// Get API URL - check at runtime for proper environment detection
const getApiUrl = () => {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're in production mode (Vite sets PROD=true in production builds)
  // In production builds, PROD will be true, DEV will be false
  if (import.meta.env.PROD) {
    // In production, always use relative path (Vercel serverless function)
    return '/api/analyze';
  }
  
  // In development mode, use local backend
  // This only runs when using npm run dev locally
  return 'http://localhost:3001/api/analyze';
};

/**
 * Analyze call transcript using NeuralSeek agent via proxy
 */
export async function analyzeCallTranscript(transcript, emailRecipients = '') {
  try {
    // Get API URL at runtime to ensure correct environment detection
    const apiUrl = getApiUrl();
    console.log('Using API URL:', apiUrl); // Debug log
    
    const response = await fetch(apiUrl, {
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

