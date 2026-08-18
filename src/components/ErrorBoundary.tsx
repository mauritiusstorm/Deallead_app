import { Component, type ReactNode } from 'react'
import { ErrorState } from './ui'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center">
          <ErrorState onRetry={() => this.setState({ hasError: false })} />
        </div>
      )
    }
    return this.props.children
  }
}
