/**
 * ErrorBoundary — Catches React rendering errors (especially Three.js crashes)
 * and shows a graceful fallback instead of a white screen.
 */
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[ErrorBoundary] Caught:', error.message, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--void, #03050a)',
          color: 'var(--hud-green, #00ff88)',
          fontFamily: 'var(--font-display, monospace)',
          fontSize: '13px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textAlign: 'center',
          padding: '2rem',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚠</div>
          <div>RENDER SUBSYSTEM FAULT</div>
          <div style={{ opacity: 0.5, fontSize: '10px', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred in the 3D pipeline.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem',
              border: '1px solid var(--hud-green, #00ff88)',
              color: 'var(--hud-green, #00ff88)',
              background: 'transparent',
              padding: '10px 24px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '11px',
              letterSpacing: '0.15em',
            }}
          >
            RETRY SUBSYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
