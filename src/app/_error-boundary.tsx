import { Component, ReactNode } from 'react';

import { logger } from '@/shared/lib';

type ErrorBoundaryProps = {
  fallback: (props: { error: unknown; resetError: () => void }) => ReactNode;
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: unknown;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown) {
    logger.error(error);
  }

  resetError = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error !== null) {
      return this.props.fallback({ error: this.state.error, resetError: this.resetError });
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
