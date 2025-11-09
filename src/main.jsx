import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

if (!domain || !clientId) {
  console.error(
    "Auth0 configuration missing. Ensure VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID exist in .env"
  );
  throw new Error("Missing Auth0 environment variables");
}

if (!domain.includes(".auth0.com")) {
  console.warn(
    "Auth0 domain appears atypical. Expected something like your-tenant.auth0.com"
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element with id 'root' not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
