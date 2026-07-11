import React from 'react'
import { AlertOctagon, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-100">
          <div className="card p-8 max-w-xl w-full text-center space-y-6">
            <div className="w-16 h-16 bg-danger-50 text-danger-500 rounded-full flex items-center justify-center mx-auto">
              <AlertOctagon size={36} />
            </div>
            
            <div>
              <h2 className="font-heading font-bold text-2xl text-neutral-800">Something went wrong</h2>
              <p className="text-neutral-500 text-sm mt-2">
                An unexpected runtime error occurred. Our team has been notified.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-left overflow-x-auto max-h-48">
              <p className="font-mono text-xs text-danger-700 font-bold">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="font-mono text-[10px] text-neutral-500 mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={this.handleReset}
                className="btn-primary flex-1 justify-center py-3"
              >
                <Home size={16} /> Go Home
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary flex-1 justify-center py-3"
              >
                <RefreshCw size={16} /> Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
