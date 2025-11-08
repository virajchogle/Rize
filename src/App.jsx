import { useState } from 'react';
import LandingPage from './components/LandingPage';
import TaxFinder from './components/TaxFinder';
import CallTranscriptionApp from './components/CallTranscriptionApp';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'call-recording', 'tax-finder'

  const handleSelectApp = (app) => {
    setCurrentView(app);
  };

  const handleBack = () => {
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage onSelectApp={handleSelectApp} />
      )}
      {currentView === 'call-recording' && (
        <CallTranscriptionApp onBack={handleBack} />
      )}
      {currentView === 'tax-finder' && (
        <TaxFinder onBack={handleBack} />
      )}
    </>
  );
}
