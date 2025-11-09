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
    agent: 'summarize_agent', // Agent for summarization
    prompt: 'Summarize this call transcript with key highlights and main points.'
  },
  'generate-email': {
    agent: 'pehla_agent', // Original email generation agent (correct one)
    prompt: 'Generate a professional follow-up email based on this call transcript.'
  },
  'heatmap': {
    agent: 'heatmap_agent', // Agent for heatmap visualization
    prompt: 'Analyze this call transcript and create a talk track heatmap showing recurring topics, objections, and value propositions. Return as structured JSON with topics and their frequency.'
  },
  'feature-requests': {
    agent: 'feature_request_agent', // Agent for feature request extraction
    prompt: 'Extract and quantify product feature requests and enhancement discussions from this call transcript. Return as structured JSON with feature names and request frequency.'
  },
  'call-dashboard': {
    agent: 'dashboard_agent', // Agent for call dashboard
    prompt: 'Create a comprehensive call review dashboard for this transcript including: call summary, sentiment timeline, topic heatmap, action items, objections, and talk-to-listen ratio. Return as structured JSON.'
  },
  'call-notes': {
    agent: 'notes_agent', // Agent for structured notes
    prompt: 'Extract structured call notes from this transcript including: key discussion points, next steps, customer sentiment, and objections. Format as structured data suitable for CSV export.'
  },
  'call-prep': {
    agent: 'prep_agent', // Agent for call preparation
    prompt: 'Prepare call intelligence for this account including: high-level summary of meetings, open action items, recurring themes, and most recent meeting highlights with tone and next steps.'
  },
  'call-scoring': {
    agent: 'scoring_agent', // Agent for performance scoring
    prompt: 'Score this call transcript on performance metrics including: talk-to-listen ratio, sentiment shifts, clarity of pitch, objection handling, and closing strength. Return as JSON with score, justification, and coaching suggestions.'
  },
  'pipeline-analyzer': {
    agent: 'pipeline_agent', // Agent for pipeline analysis
    prompt: 'Analyze pipeline momentum from this call transcript. Identify deal activity patterns, velocity metrics, risks, and stage progression. Return as structured JSON.'
  },
  'pii-wipe': {
    agent: 'pii_agent', // Agent for PII redaction
    prompt: 'Analyze this call transcript after redacting PII (personally identifiable information). Provide a secure summary with all sensitive data removed.'
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

  if (!transcript || !transcript.trim()) {
    throw new Error('Transcript is required');
  }

  try {
    const apiUrl = getApiUrl();
    
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

