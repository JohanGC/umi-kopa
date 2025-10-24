// components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error capturado por Error Boundary:', error);
    console.error('📋 Component stack:', errorInfo.componentStack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h4>⚠️ Algo salió mal</h4>
            <p>Ha ocurrido un error en la aplicación.</p>
            <details className="mt-3">
              <summary>Detalles del error (para desarrolladores)</summary>
              <pre className="mt-2 p-2 bg-light border rounded">
                {this.state.error && this.state.error.toString()}
                {'\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
            <div className="mt-3">
              <button 
                className="btn btn-primary me-2"
                onClick={() => window.location.reload()}
              >
                🔄 Recargar Página
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                Intentar de Nuevo
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;