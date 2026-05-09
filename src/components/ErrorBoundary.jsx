import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center text-slate-950">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-brand-blue">Something went wrong.</h1>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
            >
              Reload
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
