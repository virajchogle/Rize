import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TaxFinder from './components/TaxFinder';
import CallTranscriptionApp from './components/CallTranscriptionApp';

export default function App() {
  const navigate = useNavigate();

  const handleSelectApp = (app) => {
    navigate(`/${app}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onSelectApp={handleSelectApp} />} />
      <Route path="/call-recording" element={<CallTranscriptionApp onBack={handleBack} />} />
      <Route path="/call-recording/:featureId" element={<CallTranscriptionApp onBack={handleBack} />} />
      <Route path="/tax-finder" element={<TaxFinder onBack={handleBack} />} />
      
      {/* Direct feature routes */}
      <Route path="/summarize" element={<CallTranscriptionApp onBack={handleBack} initialFeature="summarize" />} />
      <Route path="/generate-email" element={<CallTranscriptionApp onBack={handleBack} initialFeature="generate-email" />} />
      <Route path="/heatmap" element={<CallTranscriptionApp onBack={handleBack} initialFeature="heatmap" />} />
      <Route path="/feature-requests" element={<CallTranscriptionApp onBack={handleBack} initialFeature="feature-requests" />} />
      <Route path="/call-dashboard" element={<CallTranscriptionApp onBack={handleBack} initialFeature="call-dashboard" />} />
      <Route path="/call-scoring" element={<CallTranscriptionApp onBack={handleBack} initialFeature="call-scoring" />} />
      <Route path="/pipeline-analyzer" element={<CallTranscriptionApp onBack={handleBack} initialFeature="pipeline-analyzer" />} />
      <Route path="/pii-wipe" element={<CallTranscriptionApp onBack={handleBack} initialFeature="pii-wipe" />} />
    </Routes>
  );
}
