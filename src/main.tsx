import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import { AppProvider } from "./state/AppContext";
import { initTMA } from "./tma/initTMA";

function Root() {
  useEffect(() => {
    console.log("Root component mounted, initializing TMA...");
    initTMA().catch((err) => {
      console.error("Failed to initialize TMA:", err);
    });
  }, []);
  return (
    <StrictMode>
      <BrowserRouter>
        <AppProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AppProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found!");
}

console.log("Initializing React app...");
createRoot(rootElement).render(<Root />);
