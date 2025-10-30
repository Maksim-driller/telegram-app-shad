import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error(err);
    try {
      const wa = (window as any).Telegram?.WebApp;
      if (wa?.showAlert) wa.showAlert('Произошла ошибка. Попробуйте ещё раз.');
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card">
          <div className="h1">Что-то пошло не так</div>
          <div className="label-muted">Пожалуйста, перезапустите Mini App.</div>
        </div>
      );
    }
    return this.props.children;
  }
}


