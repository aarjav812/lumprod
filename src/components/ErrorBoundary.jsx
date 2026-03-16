import { Component } from 'react';
import PropTypes from 'prop-types';
import Button from './ui/Button';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }


  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon" aria-hidden="true">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path
                  d="M32 8L8 56H56L32 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                />
                <path
                  d="M32 24V36M32 44V44.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                />
              </svg>
            </div>
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__message">
              {this.props.errorMessage || 'An unexpected error occurred. Please try again.'}
            </p>
            {import.meta.env.MODE === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error Details</summary>
                <pre className="error-boundary__error-text">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="error-boundary__actions">
              <Button onClick={this.handleReset} size="large">
                Try Again
              </Button>
              {this.props.showHomeButton && (
                <Button
                  variant="outline"
                  size="large"
                  onClick={() => (window.location.href = '/')}
                >
                  Go Home
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  errorMessage: PropTypes.string,
  onReset: PropTypes.func,
  showHomeButton: PropTypes.bool,
};

ErrorBoundary.defaultProps = {
  showHomeButton: true,
};

export default ErrorBoundary;
