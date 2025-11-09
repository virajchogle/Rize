export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, emailRecipients, featureId, featurePrompt, agent } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  try {
    // Use environment variables (set in Vercel dashboard for production)
    const apiUrl = process.env.NEURALSEEK_API_URL || 'https://stagingapi.neuralseek.com/v1/stony21';
    
    if (!process.env.NEURALSEEK_API_KEY) {
      return res.status(500).json({ 
        error: 'NeuralSeek API key not configured',
        message: 'Please set NEURALSEEK_API_KEY in your Vercel environment variables'
      });
    }

    // Use the agent from request body (feature-specific), fallback to env or default
    const agentToUse = agent || process.env.NEURALSEEK_AGENT || 'pehla_agent';

    // Build params - all agents use callTranscript consistently
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
    console.log(`Transcript length: ${transcript?.length || 0}`);
    
    const response = await fetch(`${apiUrl}/maistro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEURALSEEK_API_KEY
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
      return res.status(response.status).json({ 
        error: `NeuralSeek API error: ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    
    console.log('NeuralSeek Response Variables:', Object.keys(data.variables || {}));
    
    let analysis = {};
    try {
      let callAnalysisContent = null;
      
      // First try to get from callAnalysis variable
      if (data.variables?.callAnalysis) {
        callAnalysisContent = data.variables.callAnalysis;
        console.log('Found callAnalysis variable');
      } 
      // If not found, check the answer field for "Structured Call Analysis:" format
      else if (data.answer && data.answer.includes('Structured Call Analysis:')) {
        console.log('Found structured data in answer field');
        callAnalysisContent = data.answer;
        
        // Remove any headers like "# Final output\n" and get content after "Structured Call Analysis:"
        if (callAnalysisContent.includes('Structured Call Analysis:')) {
          const parts = callAnalysisContent.split('Structured Call Analysis:');
          callAnalysisContent = parts[parts.length - 1]; // Get the last part after the split
        }
      }
      
      if (callAnalysisContent) {
        console.log('Raw callAnalysis (first 200):', callAnalysisContent.substring(0, 200));
        console.log('Raw callAnalysis (last 50):', callAnalysisContent.substring(callAnalysisContent.length - 50));
        
        // Remove markdown code block wrapper if present - be more aggressive
        callAnalysisContent = callAnalysisContent.trim();
        
        // Remove opening markdown
        if (callAnalysisContent.startsWith('```json')) {
          callAnalysisContent = callAnalysisContent.substring(7);
        } else if (callAnalysisContent.startsWith('```')) {
          callAnalysisContent = callAnalysisContent.substring(3);
        }
        
        // Remove closing markdown (if present)
        callAnalysisContent = callAnalysisContent.trim();
        if (callAnalysisContent.endsWith('```')) {
          callAnalysisContent = callAnalysisContent.substring(0, callAnalysisContent.length - 3);
        }
        
        // Final trim to remove any whitespace
        callAnalysisContent = callAnalysisContent.trim();
        
        console.log('Cleaned callAnalysis (first 200):', callAnalysisContent.substring(0, 200));
        
        analysis = JSON.parse(callAnalysisContent);
        
        // Transform keyPoints if they have nested structure with topic/requests
        if (analysis.keyPoints && Array.isArray(analysis.keyPoints)) {
          const firstItem = analysis.keyPoints[0];
          if (firstItem && typeof firstItem === 'object' && firstItem.topic && firstItem.requests) {
            // Flatten the nested structure
            const flatKeyPoints = [];
            analysis.keyPoints.forEach(section => {
              if (section.topic && section.requests && Array.isArray(section.requests)) {
                // Add topic as a header
                flatKeyPoints.push(`**${section.topic}:**`);
                // Add all requests
                section.requests.forEach(request => {
                  flatKeyPoints.push(request);
                });
              }
            });
            analysis.keyPoints = flatKeyPoints;
          }
        }
        
        console.log('Parsed analysis:', { 
          hasSummary: !!analysis.summary, 
          keyPointsCount: analysis.keyPoints?.length || 0,
          actionItemsCount: analysis.actionItems?.length || 0 
        });
      } else {
        console.log('No callAnalysis variable found in response');
      }
    } catch (e) {
      console.error('Error parsing callAnalysis:', e.message);
      console.error('callAnalysis content type:', typeof data.variables?.callAnalysis);
    }

    // Parse email data from the new email_agent format
    let emailData = {};
    let emailBody = '';
    let emailSubject = '';
    let emailTo = '';
    
    try {
      let emailBodyContent = null;
      
      // First check emailBody variable
      if (data.variables?.emailBody) {
        emailBodyContent = data.variables.emailBody;
      }
      // Also check if email is in the answer field after "Drafted Email Body:"
      else if (data.answer && data.answer.includes('Drafted Email Body:')) {
        const parts = data.answer.split('Drafted Email Body:');
        if (parts.length > 1) {
          emailBodyContent = parts[1].trim();
          console.log('Found email in answer field');
        }
      }
      
      if (emailBodyContent) {
        
        // Remove markdown code block wrapper if present (```json\n ... ```)
        if (emailBodyContent.startsWith('```json')) {
          // Remove opening ```json\n (7 characters)
          emailBodyContent = emailBodyContent.substring(7);
          // Remove closing ``` 
          if (emailBodyContent.endsWith('```')) {
            emailBodyContent = emailBodyContent.substring(0, emailBodyContent.length - 3);
          }
          emailBodyContent = emailBodyContent.trim();
        } else if (emailBodyContent.startsWith('```')) {
          // Handle plain ``` wrapper
          emailBodyContent = emailBodyContent.substring(3);
          if (emailBodyContent.endsWith('```')) {
            emailBodyContent = emailBodyContent.substring(0, emailBodyContent.length - 3);
          }
          emailBodyContent = emailBodyContent.trim();
        }
        
        // Try to parse as JSON (new format from email_agent)
        try {
          const parsedEmail = JSON.parse(emailBodyContent);
          if (parsedEmail.email) {
            emailData = parsedEmail.email;
            emailBody = emailData.body || '';
            emailSubject = emailData.subject || '';
            emailTo = emailData.to || '';
          } else if (parsedEmail.body) {
            // Direct format without nested email object
            emailData = parsedEmail;
            emailBody = parsedEmail.body || '';
            emailSubject = parsedEmail.subject || '';
            emailTo = parsedEmail.to || '';
          } else {
            // Old format - just plain text
            emailBody = emailBodyContent;
          }
        } catch (parseError) {
          console.log('Could not parse emailBody as JSON, treating as plain text');
          // Not JSON, treat as plain text (old format)
          emailBody = emailBodyContent;
          
          // Try to extract subject if it starts with "Subject:"
          if (emailBody.startsWith('Subject:')) {
            const lines = emailBody.split('\n');
            const subjectLine = lines[0].replace('Subject:', '').trim();
            emailSubject = subjectLine;
            // Remove the subject line from the body
            emailBody = lines.slice(1).join('\n').trim();
          }
        }
      }
      
      // Also check for direct email variable (alternative format)
      if (!emailBody && data.variables?.email) {
        if (typeof data.variables.email === 'string') {
          const parsedEmail = JSON.parse(data.variables.email);
          emailData = parsedEmail;
          emailBody = parsedEmail.body || '';
          emailSubject = parsedEmail.subject || '';
          emailTo = parsedEmail.to || '';
        } else {
          emailData = data.variables.email;
          emailBody = emailData.body || '';
          emailSubject = emailData.subject || '';
          emailTo = emailData.to || '';
        }
      }
    } catch (e) {
      console.error('Error parsing email data:', e);
      // Fallback to raw emailBody if all parsing fails
      if (data.variables?.emailBody) {
        emailBody = data.variables.emailBody;
      }
    }

    // Return response with fallback to answer field if analysis is empty
    const responseData = {
      summary: analysis.summary || '',
      keyPoints: analysis.keyPoints || [],
      actionItems: analysis.actionItems || [],
      emailBody: emailBody,
      emailSubject: emailSubject,
      emailTo: emailTo,
      rawResponse: data
    };
    
    // If no structured data found, include the raw answer for debugging
    if (!responseData.summary && !responseData.keyPoints?.length && !responseData.actionItems?.length) {
      responseData.text = data.answer || '';
      console.log('No structured data found, including raw answer in response');
    }
    
    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

