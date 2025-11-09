# Agent Mapping Reference

Each feature calls a specific NeuralSeek agent. Update the agent names in `src/services/featureAPI.js` as needed.

## Current Agent Assignments

| Feature ID | Feature Name | Agent Name | Status |
|------------|--------------|------------|--------|
| `summarize` | Summarize | `summarize_agent` | ⚠️ Update with actual agent name |
| `generate-email` | Generate Email | `pehla_agent` | ✅ Correct |
| `heatmap` | Talk Track Heatmap | `heatmap_agent` | ✅ Confirmed |
| `feature-requests` | Feature Highrequest | `feature_request_agent` | ⚠️ Update with actual agent name |
| `call-dashboard` | Single Call Review | `dashboard_agent` | ⚠️ Update with actual agent name |
| `call-notes` | Call Notes to Sheet | `notes_agent` | ⚠️ Update with actual agent name |
| `call-prep` | Call Preparation | `prep_agent` | ⚠️ Update with actual agent name |
| `call-scoring` | Call Scoring | `scoring_agent` | ⚠️ Update with actual agent name |
| `pipeline-analyzer` | Pipeline Momentum | `pipeline_agent` | ⚠️ Update with actual agent name |
| `pii-wipe` | PII Wipe & Analyze | `pii_agent` | ⚠️ Update with actual agent name |

## How to Update Agent Names

1. Open `call-transcription-app/src/services/featureAPI.js`
2. Find the `featureConfigs` object
3. Update the `agent` property for each feature
4. Save and restart the backend server

## Example

```javascript
'heatmap': {
  agent: 'dusra_agent', // Your actual agent name
  prompt: 'Analyze this call transcript...'
}
```

## Backend Behavior

- The frontend passes the agent name to the backend
- Backend uses the agent from the request
- Falls back to `NEURALSEEK_AGENT` env variable if not provided
- Final fallback is `pehla_agent`

## Notes

- `generate-email` uses `pehla_agent` (the original working agent)
- `heatmap` uses `dusra_agent` (confirmed correct)
- All other agent names are placeholders - update them with your actual NeuralSeek agent names

