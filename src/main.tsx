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
    initTMA();
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

createRoot(document.getElementById("root")!).render(<Root />);
