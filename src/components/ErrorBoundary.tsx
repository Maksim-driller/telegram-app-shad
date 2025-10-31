import type { ReactNode } from "react";
import { Component } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown, errorInfo: unknown) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", err, errorInfo);
    try {
      const wa = (window as any).Telegram?.WebApp;
      if (wa?.showAlert) wa.showAlert("Произошла ошибка. Попробуйте ещё раз.");
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            color: "var(--text)",
            background: "var(--bg)",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Что-то пошло не так
          </div>
          <div style={{ color: "var(--muted)", marginBottom: "20px" }}>
            Пожалуйста, перезапустите Mini App.
          </div>
          <details style={{ fontSize: "12px", color: "var(--muted)" }}>
            <summary>Открыть консоль для деталей</summary>
            Проверьте консоль браузера (F12) для подробностей об ошибке.
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
