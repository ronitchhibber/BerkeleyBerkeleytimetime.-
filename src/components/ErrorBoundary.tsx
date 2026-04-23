/**
 * Catches render errors so a crash in one component doesn't blank the
 * entire app. React still requires a class for this.
 */
import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  /** Display name for the fallback heading, e.g. "Gradtrak". */
  name?: string
  /** Called by the "Reset" button — typically clears the relevant store. */
  onReset?: () => void
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`, error, info.componentStack)
    void import('@/lib/observability').then(({ reportError }) =>
      reportError(error, { boundary: this.props.name, componentStack: info.componentStack })
    )
  }

  handleReload = () => window.location.reload()

  handleReset = () => {
    try {
      this.props.onReset?.()
    } finally {
      window.location.reload()
    }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border border-wellman/30 bg-bg-card p-6 shadow-2xl shadow-black/30">
          <div className="mb-3 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-wellman">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 className="serif text-[20px] font-light text-text-primary">
              Something went wrong{this.props.name ? ` in ${this.props.name}` : ''}
            </h2>
          </div>
          <p className="mono mb-4 break-words rounded border border-border-strong bg-bg-input/50 px-3 py-2 text-[11.5px] text-wellman">
            {error.name}: {error.message || '(no message)'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={this.handleReload}
              className="rounded-md bg-cal-gold px-4 py-2 text-[12px] font-semibold text-bg-primary transition-opacity hover:opacity-90"
            >
              Reload page
            </button>
            {this.props.onReset && (
              <button
                onClick={this.handleReset}
                className="rounded-md border border-wellman/40 bg-wellman/5 px-4 py-2 text-[12px] font-medium text-wellman transition-all hover:bg-wellman/10"
              >
                Reset {this.props.name ?? ''} & Reload
              </button>
            )}
          </div>
          {error.stack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-[11px] text-text-muted hover:text-text-secondary">
                Show stack trace
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto rounded border border-border bg-bg-input/40 p-2 mono text-[10.5px] text-text-muted whitespace-pre-wrap">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }
}
