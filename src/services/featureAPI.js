/**
 * Feature API Service
 * Handles different feature types and their specific API calls
 */

// Determine API URL based on environment
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    return '/api/analyze';
  }
  return 'http://localhost:3001/api/analyze';
};

/**
 * Feature-specific prompts/configurations
 */
const featureConfigs = {
  'summarize': {
    agent: 'summary_agent', // Agent for summarization
    prompt: 'Summarize this call transcript with key highlights and main points.'
  },
  'generate-email': {
    agent: 'email_agent', // Dedicated email generation agent
    prompt: 'Generate a professional follow-up email based on this call transcript.'
  },
  'heatmap': {
    agent: 'heatmap_agent', // Agent for heatmap visualization
    prompt: 'Analyze this call transcript and create a talk track heatmap showing recurring topics, objections, and value propositions. Return as structured JSON with topics and their frequency.'
  },
  'feature-requests': {
    agent: 'feedback_report_agent', // Agent for comprehensive feedback analysis
    prompt: 'Analyze this call transcript and generate a comprehensive feedback report including: feature request leaderboard with frequencies, customer segment analysis, account tier analysis, and actionable insights. Return as structured JSON.'
  },
  'call-dashboard': {
    agent: 'singleCallAgent', // Agent for comprehensive single call review
    prompt: 'Create a comprehensive call review dashboard for this transcript including: call summary, sentiment timeline, topic heatmap, action items, and talk-to-listen ratio. Return as structured JSON.'
  },
  'call-scoring': {
    agent: 'call_scoring_agent', // Agent for comprehensive call performance scoring
    prompt: 'Score this call transcript on performance metrics including: listening skills, tone, engagement, and overall performance. Return as JSON with score, justification (strengths and weaknesses), and coaching suggestions.'
  },
  'pipeline-analyzer': {
    agent: 'revenue_intelligence_agent', // Agent for revenue intelligence and pipeline analysis
    prompt: 'Analyze pipeline momentum and revenue intelligence from this data. Identify deal activity patterns, velocity metrics, risks, stage progression, and revenue forecasts. Generate a comprehensive summary report.'
  },
  'pii-wipe': {
    agent: 'listener_agent', // Agent for PII redaction and structured analysis
    prompt: 'Analyze this call transcript after redacting PII (personally identifiable information). Provide a secure, structured summary with all sensitive customer data removed, including CSR name, customer feedback by category, and CSR response.'
  },
  'tax-finder': {
    agent: 'sales_tax_agent', // Agent for sales tax lookup by address
    prompt: 'Look up comprehensive tax rates for this address.'
  }
};

/**
 * Analyze transcript using a specific feature
 */
export async function analyzeFeature(featureId, transcript, additionalParams = {}) {
  const config = featureConfigs[featureId];
  
  if (!config) {
    throw new Error(`Unknown feature: ${featureId}`);
  }

  // Transcript validation - pipeline analyzer and tax-finder can have empty transcript initially
  if (!transcript || !transcript.trim()) {
    if (featureId === 'pipeline-analyzer' || featureId === 'tax-finder') {
      // For pipeline analyzer and tax-finder, transcript can be empty (waiting for CSV/address input)
      // This is okay - it won't auto-process
    } else {
      throw new Error('Transcript is required');
    }
  }

  try {
    const apiUrl = getApiUrl();
    
    console.log('Sending to backend:', {
      agent: config.agent,
      featureId: featureId,
      transcriptLength: transcript?.length || 0
    });
    
    // For now, we'll use the same NeuralSeek API endpoint
    // In the future, you can create feature-specific endpoints
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: transcript,
        featureId: featureId,
        featurePrompt: config.prompt,
        agent: config.agent, // Pass the specific agent for this feature
        emailRecipients: additionalParams.emailRecipients || '',
        ...additionalParams
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the data in a format suitable for the feature
    // You can customize this based on each feature's needs
    return data;
  } catch (error) {
    console.error('Feature API error:', error);
    throw error;
  }
}

