import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// NeuralSeek proxy endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript, emailRecipients } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const response = await fetch(`${process.env.NEURALSEEK_API_URL}/maistro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEURALSEEK_API_KEY
      },
      body: JSON.stringify({
        agent: process.env.NEURALSEEK_AGENT,
        params: {
          callTranscript: transcript,
          emailRecipients: emailRecipients || ''
        },
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

