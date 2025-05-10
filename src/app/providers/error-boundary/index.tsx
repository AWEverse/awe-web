import React, { Component } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent?: React.ElementType;
  enableLogging?: boolean;
  logLevel?: "error" | "warn" | "info" | "debug";
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void; // New for external error handling
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface LogError {
  (error: Error, errorInfo: React.ErrorInfo): void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static propTypes = {
    children: PropTypes.node.isRequired,
    FallbackComponent: PropTypes.elementType,
    enableLogging: PropTypes.bool,
    logLevel: PropTypes.oneOf(["error", "warn", "info", "debug"]),
    onError: PropTypes.func, // Optional external error handler
  };

  static defaultProps = {
    enableLogging: true,
    logLevel: "error",
    FallbackComponent: null,
  };

  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo }, () => {
      if (this.props.enableLogging) {
        this.logError(error, errorInfo);
      }

      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    });
  }

  logError: LogError = (error: Error, errorInfo: React.ErrorInfo) => {
    const { logLevel } = this.props;
    const logger = logLevel ? console[logLevel] : console.error;
    const timestamp = new Date().toISOString();

    console.groupCollapsed(
      `%cError Occurred: ${error.message}`,
      "color: red; font-weight: bold;",
    );
    logger(`Error: ${error.message}`);
    console.error(`Timestamp: ${timestamp}`);
    console.info("Component Stack:", errorInfo.componentStack);
    console.debug("Error Stack:", error.stack);
    console.groupEnd();
  };

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, FallbackComponent } = this.props;

    if (hasError) {
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resetError={this.resetErrorBoundary}
          />
        );
      }

      // Default fallback UI
      return (
        <div style={{ padding: "1rem", color: "red" }}>
          <h2>Something went wrong.</h2>
          <details style={{ marginBottom: "1rem" }}>
            <summary>Error Details</summary>
            <pre>{error && error.toString()}</pre>
            <pre>{errorInfo?.componentStack}</pre>
          </details>
          <button
            onClick={this.resetErrorBoundary}
            style={{
              padding: "0.5rem 1rem",
              background: "#ff4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
