'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error tracking service (e.g., Sentry)
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-bold">Đã xảy ra lỗi</h2>
      <p className="max-w-md text-muted-foreground">
        {error.message || 'Có lỗi không mong muốn xảy ra. Vui lòng thử lại sau.'}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
      <Button onClick={reset}>Thử lại</Button>
    </div>
  )
}
