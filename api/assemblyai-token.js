/**
 * Vercel serverless function to get AssemblyAI temporary token
 * This keeps the API key secure on the server
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get AssemblyAI API key from environment variable
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'AssemblyAI API key not configured',
        message: 'Please set ASSEMBLYAI_API_KEY in your Vercel environment variables'
      });
    }

    // Request a temporary token from AssemblyAI
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        expires_in: 3600 // Token expires in 1 hour
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `AssemblyAI API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    res.status(200).json({
      token: data.token
    });

  } catch (error) {
    console.error('Error getting AssemblyAI token:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

