'use client'
import React from 'react';

type Props = {
  children: React.ReactNode;
  name?: string;
};

type State = {
  hasError: boolean;
  error?: Error | null;
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Optionally log to an external service here
    // console.error(`ErrorBoundary (${this.props.name || 'Unknown'}):`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          <strong>Something went wrong</strong>
          <div className="mt-2 text-sm">{this.props.name ? `${this.props.name} component failed.` : 'An error occurred.'}</div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
