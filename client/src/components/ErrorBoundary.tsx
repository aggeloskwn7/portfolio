import React from 'react';
import { Button } from '@/components/ui/button';
interface ErrorBoundaryProps {
    children: React.ReactNode;
}
interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
    handleReload = (): void => {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                });
            });
        }
        window.location.href = '/';
    };
    render(): React.ReactNode {
        if (this.state.hasError) {
            return (<div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try reloading the page.
            </p>
            {this.state.error && (<div className="bg-gray-50 p-3 rounded mb-6 text-left overflow-auto max-h-32 text-sm">
                <code className="text-red-600">{this.state.error.toString()}</code>
              </div>)}
            <div className="flex flex-col gap-3">
              <Button onClick={this.handleReload} className="bg-accent hover:bg-accent/90 text-white">
                Reload Page
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>);
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
