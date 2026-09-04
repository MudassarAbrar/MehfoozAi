import {Component, StrictMode, type ErrorInfo, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Minimal top-level boundary — keeps a render crash from blanking the app.
 * NOTE: this project installs no @types/react, so `Component` resolves as
 * `any`; the `props` member is declared explicitly below for that reason.
 */
class ErrorBoundary extends Component {
  declare readonly props: { children?: ReactNode };
  state = {hasError: false, message: ''};

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, message: error.message || 'Unknown error'};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Mehfooz render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '24px', fontFamily: 'system-ui, sans-serif', textAlign: 'center'}}>
          <h1 style={{fontSize: '18px'}}>Something went wrong</h1>
          <p style={{fontSize: '13px', opacity: 0.7, marginBottom: '16px'}}>{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'}}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
