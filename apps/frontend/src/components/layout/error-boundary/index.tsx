import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hataları merkezi bir log servisine göndermek istersen burayı kullanabilirsin
    console.error('ErrorBoundary caught an error', error, info)
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    } else {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[240px] flex flex-col items-center justify-center gap-4 text-center px-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Beklenmeyen bir hata oluştu</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Lütfen sayfayı yenilemeyi deneyin. Sorun devam ederse daha sonra tekrar deneyebilirsiniz.</p>
          </div>
          <Button variant="outline" onClick={this.handleReload}>
            Sayfayı Yenile
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
export { ErrorBoundary }
