/**
 * Vercel serverless function to transcribe audio using AssemblyAI
 * This keeps the API key secure on the server
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audio, format } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'AssemblyAI API key not configured',
        message: 'Please set ASSEMBLYAI_API_KEY in your Vercel environment variables'
      });
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Upload audio to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey
      },
      body: audioBuffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return res.status(uploadResponse.status).json({ 
        error: `AssemblyAI upload error: ${uploadResponse.status}`,
        details: errorText
      });
    }

    const { upload_url } = await uploadResponse.json();

    // Start transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: upload_url
      })
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      return res.status(transcriptResponse.status).json({ 
        error: `AssemblyAI transcript error: ${transcriptResponse.status}`,
        details: errorText
      });
    }

    const { id } = await transcriptResponse.json();

    // Poll for transcription result
    let transcriptData = null;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max wait (longer for production)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: {
          'Authorization': apiKey
        }
      });

      transcriptData = await statusResponse.json();

      if (transcriptData.status === 'completed') {
        break;
      } else if (transcriptData.status === 'error') {
        return res.status(500).json({ 
          error: 'Transcription failed',
          details: transcriptData.error
        });
      }

      attempts++;
    }

    if (transcriptData && transcriptData.status === 'completed') {
      res.status(200).json({
        text: transcriptData.text || '',
        transcript: transcriptData.text || ''
      });
    } else {
      res.status(500).json({ 
        error: 'Transcription timeout',
        message: 'Transcription took too long to complete'
      });
    }

  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

