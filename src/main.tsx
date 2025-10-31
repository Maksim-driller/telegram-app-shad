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
  console.error("Root element not found!");
  document.body.innerHTML =
    '<div style="padding: 20px; text-align: center; color: #f2f2f7; background: #0c0c0f;"><h1>Ошибка инициализации</h1><p>Элемент #root не найден</p></div>';
} else {
  try {
    console.log("Initializing React app...");
    createRoot(rootElement).render(<Root />);
  } catch (error) {
    console.error("Failed to render React app:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #f2f2f7; background: #0c0c0f;">
        <h1>Ошибка загрузки приложения</h1>
        <p>Проверьте консоль браузера (F12) для деталей</p>
        <pre style="text-align: left; margin-top: 20px; font-size: 12px; color: #a1a1aa;">${
          error instanceof Error ? error.message : String(error)
        }</pre>
      </div>
    `;
  }
}
