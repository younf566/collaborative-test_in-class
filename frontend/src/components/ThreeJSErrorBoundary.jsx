import { Component } from 'react';

class ThreeJSErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: '#f8f9fa',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h2 style={{ color: '#333', marginBottom: '16px' }}>3D Neighborhood Error</h2>
          <p style={{ color: '#666', marginBottom: '24px', textAlign: 'center', maxWidth: '500px' }}>
            The 3D visualization encountered an error. This might be due to WebGL compatibility or missing dependencies.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            ← Back to Protocol Builder
          </button>
          <details style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ThreeJSErrorBoundary;