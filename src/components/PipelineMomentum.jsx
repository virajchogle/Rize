import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Activity, AlertTriangle, Download, Copy, BarChart3, Upload, Users } from 'lucide-react';

export default function PipelineMomentum({ result, onReanalyze }) {
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Don't show error if there's no result yet (waiting for CSV upload)
    if (!result) {
      setError(null);
      setReportData(null);
      return;
    }

    if (!result.rawResponse) {
      setError('Invalid response format - missing rawResponse');
      return;
    }

    try {
      // Try to get summaryReport from variables
      const variables = result.rawResponse.variables || {};
      let summaryReport = variables.summaryReport || 
                          variables.report || 
                          variables.pipelineAnalysis ||
                          result.rawResponse.answer || '';
      
      if (!summaryReport) {
        console.log('Available variables:', Object.keys(variables));
        setError('No pipeline report data in response. Available data: ' + Object.keys(variables).join(', '));
        return;
      }

      console.log('Raw summaryReport (first 200):', summaryReport.substring(0, 200));

      // Try to parse as JSON (wrapped in ```json or plain JSON)
      let parsedData = null;
      
      // Remove any text before the JSON if present (like "To analyze the provided CSV...")
      // Look for the start of JSON code block
      if (summaryReport.includes('```json')) {
        const jsonStart = summaryReport.indexOf('```json');
        summaryReport = summaryReport.substring(jsonStart);
      } else if (summaryReport.includes('```')) {
        const jsonStart = summaryReport.indexOf('```');
        summaryReport = summaryReport.substring(jsonStart);
      }
      
      // Remove markdown code block wrapper if present
      let cleanedReport = summaryReport.trim();
      
      // Remove opening markdown
      if (cleanedReport.startsWith('```json')) {
        cleanedReport = cleanedReport.substring(7);
      } else if (cleanedReport.startsWith('```')) {
        cleanedReport = cleanedReport.substring(3);
      }
      
      // Remove closing markdown
      cleanedReport = cleanedReport.trim();
      if (cleanedReport.endsWith('```')) {
        cleanedReport = cleanedReport.substring(0, cleanedReport.length - 3);
      }
      
      cleanedReport = cleanedReport.trim();
      
      console.log('Cleaned summaryReport (first 200):', cleanedReport.substring(0, 200));
      console.log('Cleaned summaryReport (last 100):', cleanedReport.substring(Math.max(0, cleanedReport.length - 100)));
      
      try {
        parsedData = JSON.parse(cleanedReport);
        
        // If the data has a nested "summary" object, use that
        if (parsedData.summary && typeof parsedData.summary === 'object') {
          parsedData = parsedData.summary;
        }
        
        console.log('Parsed pipeline data keys:', Object.keys(parsedData));
        setReportData(parsedData);
        setError(null);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        
        // Try to repair incomplete JSON by adding missing closing braces
        console.log('Attempting to repair incomplete JSON...');
        
        try {
          // Count opening and closing braces
          const openBraces = (cleanedReport.match(/{/g) || []).length;
          const closeBraces = (cleanedReport.match(/}/g) || []).length;
          const openBrackets = (cleanedReport.match(/\[/g) || []).length;
          const closeBrackets = (cleanedReport.match(/]/g) || []).length;
          
          console.log(`Braces: ${openBraces} open, ${closeBraces} close (missing ${openBraces - closeBraces})`);
          console.log(`Brackets: ${openBrackets} open, ${closeBrackets} close (missing ${openBrackets - closeBrackets})`);
          
          // Add missing closing brackets and braces
          let repairedJson = cleanedReport;
          
          // Close any open arrays first
          for (let i = 0; i < (openBrackets - closeBrackets); i++) {
            repairedJson += '\n]';
          }
          
          // Then close any open objects
          for (let i = 0; i < (openBraces - closeBraces); i++) {
            repairedJson += '\n}';
          }
          
          console.log('Repaired JSON (last 100):', repairedJson.substring(Math.max(0, repairedJson.length - 100)));
          
          parsedData = JSON.parse(repairedJson);
          
          // If the data has a nested "summary" object, use that
          if (parsedData.summary && typeof parsedData.summary === 'object') {
            parsedData = parsedData.summary;
          }
          
          console.log('Successfully repaired and parsed JSON! Keys:', Object.keys(parsedData));
          setReportData(parsedData);
          setError(null);
        } catch (repairError) {
          console.error('Failed to repair JSON:', repairError);
          // If repair fails, treat as plain text report
          console.log('Treating as plain text report');
          setReportData({ textReport: cleanedReport });
          setError(null);
        }
      }
    } catch (err) {
      console.error('Error processing pipeline report:', err);
      setError(`Failed to process pipeline report: ${err.message}`);
    }
  }, [result]);

  const copyToClipboard = (text, itemId) => {
    const textToCopy = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    
    // Read the CSV file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setCsvData(content);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read CSV file');
    };
    reader.readAsText(file);
  };

  const handleAnalyzeCSV = async () => {
    if (!csvData) {
      setError('Please upload a CSV file first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('CSV Data length:', csvData.length);
      console.log('CSV Data preview:', csvData.substring(0, 200));
      
      // Call the reanalyze function with CSV data as transcript
      if (onReanalyze) {
        await onReanalyze(csvData);  // Pass CSV data as transcript
      }
    } catch (err) {
      console.error('CSV Analysis error:', err);
      setError(`Failed to analyze CSV: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const content = reportData.textReport || JSON.stringify(reportData, null, 2);
    const blob = new Blob([content], { type: reportData.textReport ? 'text/plain' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline_momentum_${Date.now()}.${reportData.textReport ? 'txt' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = (content) => {
    if (typeof content === 'string') {
      return <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>;
    } else if (Array.isArray(content)) {
      return (
        <ul className="space-y-2">
          {content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-900 text-xs font-bold flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="text-sm text-gray-700 flex-1">
                {typeof item === 'string' ? item : JSON.stringify(item)}
              </span>
            </li>
          ))}
        </ul>
      );
    } else if (typeof content === 'object' && content !== null) {
      return (
        <div className="space-y-3">
          {Object.entries(content).map(([key, value], idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-1 capitalize">{key.replace(/_/g, ' ')}</h5>
              <div className="text-sm text-gray-700">
                {typeof value === 'string' ? value : 
                 Array.isArray(value) ? renderContent(value) :
                 JSON.stringify(value, null, 2)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-sm text-gray-500 italic">No data available</p>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Pipeline Momentum & Revenue Intelligence</h3>
            <p className="text-sm text-gray-600">Deal activity, velocity metrics & forecasts</p>
          </div>
        </div>
        
        {reportData && (
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(reportData, 'report')}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Copy report"
            >
              <Copy className="w-4 h-4" />
              {copiedItem === 'report' ? 'Copied!' : 'Copy Report'}
            </button>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 transition-all"
              title="Download report"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* CSV Info Notice - Show prominently when no data */}
      {!reportData && !isProcessing && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6 shadow-md">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-2 text-lg">Upload Your Pipeline Data</h4>
              <p className="text-sm text-blue-800 mb-3">
                This feature analyzes CSV files containing deal information to provide revenue intelligence insights.
              </p>
              <div className="bg-white/70 p-3 rounded-lg">
                <p className="text-xs text-blue-900 font-medium mb-1">📊 Expected CSV columns:</p>
                <p className="text-xs text-blue-700 mb-2">
                  Deal Name, Stage, Amount, Close Date, Last Activity, Owner, etc.
                </p>
                <a
                  href="/sample-pipeline-data.csv"
                  download
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  <Download className="w-3 h-3" />
                  Download Sample CSV
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Section */}
      <div className={`bg-white border-2 rounded-xl p-6 shadow-lg ${!reportData && !isProcessing ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-6 h-6 text-blue-600" />
          <h4 className="text-lg font-bold text-gray-900">{csvFile ? 'Upload New CSV' : 'Upload CSV Data'}</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label 
              htmlFor="csv-upload" 
              className="flex-1 cursor-pointer"
            >
              <div className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                csvFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
              }`}>
                <div className="flex flex-col items-center gap-2">
                  {csvFile ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-lg">✓</span>
                      </div>
                      <p className="text-sm font-medium text-green-700">
                        {csvFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Click to upload a different file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-blue-500" />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload CSV file
                      </p>
                      <p className="text-xs text-gray-500">
                        Deal names, stages, amounts, close dates, activities
                      </p>
                    </>
                  )}
                </div>
              </div>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {csvFile && (
            <button
              onClick={handleAnalyzeCSV}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Analyzing CSV Data...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Analyze Pipeline Data
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">Analyzing Your Pipeline Data</h4>
              <p className="text-sm text-blue-700">
                Processing CSV and generating revenue intelligence insights...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isProcessing && (
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-900 mb-2">Report Processing Issue</h4>
              <p className="text-sm text-red-800 mb-3">{error}</p>
              
              {result && result.rawResponse && (
                <details className="mt-3">
                  <summary className="text-xs text-red-700 cursor-pointer hover:text-red-900 font-medium">
                    🔍 View Raw API Response (for debugging)
                  </summary>
                  <div className="mt-2 p-3 bg-white rounded border border-red-200 max-h-96 overflow-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {JSON.stringify(result.rawResponse, null, 2)}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      {!error && reportData && (
        <div className="space-y-6">
          {/* Text Report */}
          {reportData.textReport && (
            <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h4 className="text-xl font-bold text-gray-900">Summary Report</h4>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {reportData.textReport}
                </p>
              </div>
            </div>
          )}

          {/* Structured Report Sections */}
          {!reportData.textReport && (
            <>
              {/* Fast Moving Deals */}
              {reportData.fast_moving_deals && reportData.fast_moving_deals.length > 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <h4 className="text-xl font-bold text-gray-900">🚀 Fast Moving Deals</h4>
                    <span className="ml-auto bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {reportData.fast_moving_deals.length} deals
                    </span>
                  </div>
                  <div className="space-y-3">
                    {reportData.fast_moving_deals.map((deal, idx) => (
                      <div key={idx} className="p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-gray-900">{deal.deal_name}</h5>
                          <span className="text-lg font-bold text-green-700">
                            ${(deal.amount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Account:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.account}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rep:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.rep_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stage:</span>
                            <span className="ml-2 font-medium text-blue-700">{deal.stage}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Activity:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.last_activity_date}</span>
                          </div>
                        </div>
                        {deal.next_step && deal.next_step !== 'N/A' && (
                          <div className="mt-2 p-2 bg-white rounded border border-green-200">
                            <span className="text-xs text-gray-600">Next Step:</span>
                            <p className="text-sm text-gray-800 mt-1">{deal.next_step}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactivity Red Flags */}
              {reportData.inactivity_red_flags && reportData.inactivity_red_flags.length > 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h4 className="text-xl font-bold text-gray-900">⚠️ Inactivity Red Flags</h4>
                    <span className="ml-auto bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {reportData.inactivity_red_flags.length} at risk
                    </span>
                  </div>
                  <div className="space-y-3">
                    {reportData.inactivity_red_flags.map((deal, idx) => (
                      <div key={idx} className="p-4 bg-red-50 rounded-lg border-2 border-red-200 hover:border-red-400 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-gray-900">{deal.deal_name}</h5>
                          <span className="text-lg font-bold text-red-700">
                            ${(deal.amount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Account:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.account}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rep:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.rep_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stage:</span>
                            <span className="ml-2 font-medium text-red-700">{deal.stage}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Activity:</span>
                            <span className="ml-2 font-medium text-red-800">{deal.last_activity_date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stage Slippage */}
              {reportData.stage_slippage && reportData.stage_slippage.length > 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-6 h-6 text-orange-600" />
                    <h4 className="text-xl font-bold text-gray-900">📉 Stage Slippage</h4>
                    <span className="ml-auto bg-orange-100 text-orange-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {reportData.stage_slippage.length} deals
                    </span>
                  </div>
                  <div className="space-y-3">
                    {reportData.stage_slippage.map((deal, idx) => (
                      <div key={idx} className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-gray-900">{deal.deal_name}</h5>
                          <span className="text-lg font-bold text-orange-700">
                            ${(deal.amount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Account:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.account}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rep:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.rep_name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Stage:</span>
                            <span className="ml-2 font-medium text-blue-700">{deal.stage}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Activity:</span>
                            <span className="ml-2 font-medium text-gray-900">{deal.last_activity_date}</span>
                          </div>
                        </div>
                        {deal.next_step && deal.next_step !== 'N/A' && (
                          <div className="mt-2 p-2 bg-white rounded border border-orange-200">
                            <span className="text-xs text-gray-600">Next Step:</span>
                            <p className="text-sm text-gray-800 mt-1">{deal.next_step}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rep Level Patterns */}
              {reportData.rep_level_patterns && Object.keys(reportData.rep_level_patterns).length > 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                    <h4 className="text-xl font-bold text-gray-900">👥 Rep-Level Performance</h4>
                    <span className="ml-auto bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {Object.keys(reportData.rep_level_patterns).length} reps
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(reportData.rep_level_patterns).map(([repName, stats], idx) => (
                      <div key={idx} className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-colors">
                        <h5 className="font-bold text-gray-900 mb-3">{repName}</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Deals:</span>
                            <span className="text-sm font-bold text-gray-900">{stats.deals || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Value:</span>
                            <span className="text-sm font-bold text-purple-700">
                              ${(stats.total_amount || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Active Deals:</span>
                            <span className="text-sm font-bold text-blue-700">{stats.active_deals || 0}</span>
                          </div>
                          {stats.closed_won !== undefined && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Closed Won:</span>
                              <span className="text-sm font-bold text-green-700">{stats.closed_won}</span>
                            </div>
                          )}
                          {stats.closed_lost !== undefined && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Closed Lost:</span>
                              <span className="text-sm font-bold text-red-700">{stats.closed_lost}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generic sections for any other data */}
              {Object.keys(reportData).filter(key => 
                !['fast_moving_deals', 'inactivity_red_flags', 'stage_slippage', 'rep_level_patterns', 'textReport'].includes(key)
              ).map((key, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-6 h-6 text-gray-600" />
                    <h4 className="text-xl font-bold text-gray-900 capitalize">{key.replace(/_/g, ' ')}</h4>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {renderContent(reportData[key])}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Report Summary Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border-2 border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">📊 Report Components</h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
                <div className="text-2xl mb-1">📈</div>
                <div className="text-xs text-gray-600">Pipeline Analysis</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs text-gray-600">Velocity Tracking</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-emerald-200">
                <div className="text-2xl mb-1">💰</div>
                <div className="text-xs text-gray-600">Revenue Intel</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-red-200">
                <div className="text-2xl mb-1">⚠️</div>
                <div className="text-xs text-gray-600">Risk Assessment</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

