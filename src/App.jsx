import { useAuth0 } from "@auth0/auth0-react";
import { Route, Routes, useNavigate } from "react-router-dom";
import CallTranscriptionApp from "./components/CallTranscriptionApp";
import LandingPage from "./components/LandingPage";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile";
import TaxFinder from "./components/TaxFinder";

export default function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useAuth0();

  const handleSelectApp = (app) => {
    navigate(`/${app}`);
  };

  const handleBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-title">Oops!</div>
          <div className="error-message">Something went wrong</div>
          <div className="error-sub-message">{error.message}</div>
        </div>
      </div>
    );
  }

  // If not authenticated, show Auth0 login page
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="main-card-wrapper">
          <img
            src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png"
            alt="Auth0 Logo"
            className="auth0-logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <h1 className="main-title">Welcome to Rize</h1>

          <div className="action-card">
            <p className="action-text">
              Get started by signing in to your account
            </p>
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Auth0 User Info Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          padding: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "0 0 0 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Profile />
        <LogoutButton />
      </div>

      {/* Main Routes */}
      <Routes>
        <Route
          path="/"
          element={<LandingPage onSelectApp={handleSelectApp} />}
        />
        <Route
          path="/call-recording"
          element={<CallTranscriptionApp onBack={handleBack} />}
        />
        <Route
          path="/call-recording/:featureId"
          element={<CallTranscriptionApp onBack={handleBack} />}
        />

        {/* Direct feature routes */}
        <Route
          path="/summarize"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="summarize"
            />
          }
        />
        <Route
          path="/generate-email"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="generate-email"
            />
          }
        />
        <Route
          path="/heatmap"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="heatmap"
            />
          }
        />
        <Route
          path="/feature-requests"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="feature-requests"
            />
          }
        />
        <Route
          path="/call-dashboard"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="call-dashboard"
            />
          }
        />
        <Route
          path="/call-scoring"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="call-scoring"
            />
          }
        />
        <Route
          path="/pipeline-analyzer"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="pipeline-analyzer"
            />
          }
        />
        <Route
          path="/pii-wipe"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="pii-wipe"
            />
          }
        />
        <Route
          path="/tax-finder"
          element={
            <CallTranscriptionApp
              onBack={handleBack}
              initialFeature="tax-finder"
            />
          }
        />
      </Routes>
    </>
  );
}
