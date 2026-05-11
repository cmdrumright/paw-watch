"use client"

import { Component, type ReactNode } from "react"
import Link from "next/link"

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-4xl">😿</p>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Something went wrong</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            An unexpected error occurred. Try refreshing the page.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/map"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Back to Map
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
