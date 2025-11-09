# Agent Mapping Reference

Each feature calls a specific NeuralSeek agent. Update the agent names in `src/services/featureAPI.js` as needed.

## Current Agent Assignments

| Feature ID | Feature Name | Agent Name | Status |
|------------|--------------|------------|--------|
| `summarize` | Summarize | `summary_agent` | ✅ Active |
| `generate-email` | Generate Email | `email_agent` | ✅ Active |
| `heatmap` | Talk Track Heatmap | `heatmap_agent` | ✅ Confirmed |
| `feature-requests` | Feature Highrequest | `feedback_report_agent` | ✅ Active |
| `call-dashboard` | Single Call Review | `singleCallAgent` | ✅ Active |
| `call-scoring` | Call Scoring | `call_scoring_agent` | ✅ Active |
| `pipeline-analyzer` | Pipeline Momentum | `revenue_intelligence_agent` | ✅ Active |
| `pii-wipe` | PII Wipe & Analyze | `listener_agent` | ✅ Active |
| `tax-finder` | Tax Finder | `sales_tax_agent` | ✅ Active |

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

- `summarize` uses `summary_agent` (extracts summary, key points, and action items from call transcripts)
- `generate-email` uses `email_agent` (dedicated email generation agent)
- `heatmap` uses `heatmap_agent` (confirmed correct)
- `feature-requests` uses `feedback_report_agent` (comprehensive feedback analysis with leaderboard)
- `call-dashboard` uses `singleCallAgent` (comprehensive single call review with summary, sentiment, topics, actions, and talk-listen ratio)
- `call-scoring` uses `call_scoring_agent` (performance scoring with justification and coaching suggestions)
- `pii-wipe` uses `listener_agent` (PII redaction with structured call summary by category)
- `pipeline-analyzer` uses `revenue_intelligence_agent` (revenue intelligence with deal activity, velocity metrics, forecasts - accepts CSV data via callTranscript parameter)
- `tax-finder` uses `sales_tax_agent` (comprehensive tax rate lookup for US addresses including state, county, city, school district, and special district taxes)
- The backend automatically uses the agent specified in the frontend configuration
- Fallback order: request agent → NEURALSEEK_AGENT env variable → pehla_agent

## Special Input Requirements

- **`pipeline-analyzer`**: This agent analyzes CSV data containing deal information (deal names, stages, amounts, close dates, activities). Upload CSV files through the UI, and the CSV data is passed as `callTranscript` (just like all other agents). This feature does NOT auto-process on load - you must upload a CSV file to trigger analysis.

- **`tax-finder`**: This agent looks up tax rates for US addresses. Enter a full address (including street, city, state, and ZIP code) through the UI, and the address is passed as `callTranscript` to the agent (which maps it to the `address` parameter). The agent returns comprehensive tax information including state income tax rates, county sales tax, city taxes, school district taxes, and special district taxes. This feature does NOT auto-process on load - you must enter an address to trigger the lookup.

