import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for audio uploads

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AssemblyAI token endpoint (for local development)
app.post('/api/assemblyai-token', async (req, res) => {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      console.error('ASSEMBLYAI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'AssemblyAI API key not configured',
        message: 'Please set ASSEMBLYAI_API_KEY in your .env file'
      });
    }

    console.log('Requesting AssemblyAI token with API key:', apiKey.substring(0, 10) + '...');

    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: {
        'Authorization': apiKey, // AssemblyAI uses API key directly, not Bearer token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expires_in: 3600 // Token expires in 1 hour
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AssemblyAI API error:', response.status, errorText);
      console.error('API Key used (first 10 chars):', apiKey ? apiKey.substring(0, 10) : 'undefined');
      return res.status(response.status).json({ 
        error: `AssemblyAI API error: ${response.status}`,
        details: errorText,
        message: 'Check if your API key is valid and active in AssemblyAI dashboard'
      });
    }

    const data = await response.json();
    console.log('Successfully obtained AssemblyAI token');
    res.json({ token: data.token });

  } catch (error) {
    console.error('Error getting AssemblyAI token:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// AssemblyAI transcription endpoint (for recorded audio chunks)
app.post('/api/assemblyai-transcribe', async (req, res) => {
  try {
    const { audio, format } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'AssemblyAI API key not configured',
        message: 'Please set ASSEMBLYAI_API_KEY in your .env file'
      });
    }

    // Upload audio to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey
      },
      body: Buffer.from(audio, 'base64')
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
    const maxAttempts = 60; // 60 seconds max wait (longer for longer recordings)

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
      res.json({
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
});

// NeuralSeek proxy endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript, emailRecipients, featureId, featurePrompt, agent } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Use environment variables from .env file
    const apiUrl = process.env.NEURALSEEK_API_URL;
    const apiKey = process.env.NEURALSEEK_API_KEY;
    
    if (!apiUrl) {
      return res.status(500).json({ 
        error: 'NeuralSeek API URL not configured',
        message: 'Please set NEURALSEEK_API_URL in your backend/.env file'
      });
    }
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'NeuralSeek API key not configured',
        message: 'Please set NEURALSEEK_API_KEY in your backend/.env file'
      });
    }

    // Use the agent from request body (feature-specific), fallback to env or default
    const agentToUse = agent || process.env.NEURALSEEK_AGENT || 'pehla_agent';

    // Build params based on feature type
    const params = {
      callTranscript: transcript,
      emailRecipients: emailRecipients || ''
    };

    // Add feature-specific prompt if provided
    if (featurePrompt) {
      params.featurePrompt = featurePrompt;
      params.featureId = featureId;
    }

    console.log(`Using agent: ${agentToUse} for feature: ${featureId || 'default'}`);

    const response = await fetch(`${apiUrl}/maistro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        agent: agentToUse,
        params: params,
        options: {
          returnVariables: true,
          returnVariablesExpanded: true,
          streaming: false
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NeuralSeek API error:', errorText);
      return res.status(response.status).json({ 
        error: `NeuralSeek API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    // Parse the callAnalysis JSON string
    let analysis = {};
    try {
      if (data.variables?.callAnalysis) {
        analysis = JSON.parse(data.variables.callAnalysis);
      }
    } catch (e) {
      console.error('Error parsing callAnalysis:', e);
    }

    res.json({
      summary: analysis.summary || '',
      keyPoints: analysis.keyPoints || [],
      actionItems: analysis.actionItems || [],
      emailBody: data.variables?.emailBody || '',
      rawResponse: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

