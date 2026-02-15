import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-8 h-8 text-error" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Algo deu errado
              </h1>
              <p className="text-gray-600 mb-6">
                Desculpe, ocorreu um erro inesperado. Por favor, tente novamente
                mais tarde.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
