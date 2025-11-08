export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, emailRecipients } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  try {
    const response = await fetch('https://stagingapi.neuralseek.com/v1/stony21/maistro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEURALSEEK_API_KEY
      },
      body: JSON.stringify({
        agent: process.env.NEURALSEEK_AGENT || 'pehla_agent',
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
      return res.status(response.status).json({ 
        error: `NeuralSeek API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    let analysis = {};
    try {
      if (data.variables?.callAnalysis) {
        analysis = JSON.parse(data.variables.callAnalysis);
      }
    } catch (e) {
      console.error('Error parsing callAnalysis:', e);
    }

    res.status(200).json({
      summary: analysis.summary || '',
      keyPoints: analysis.keyPoints || [],
      actionItems: analysis.actionItems || [],
      emailBody: data.variables?.emailBody || '',
      rawResponse: data
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

