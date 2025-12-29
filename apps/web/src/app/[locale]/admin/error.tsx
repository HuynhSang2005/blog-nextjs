'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
    // Could send to admin-specific error tracking
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="max-w-lg space-y-4 p-8 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
        <h2 className="text-2xl font-bold">Lỗi Admin Dashboard</h2>
        <p className="text-muted-foreground">{error.message}</p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-4 text-left text-xs">
            {error.stack}
          </pre>
        )}
        <div className="flex justify-center gap-2">
          <Button onClick={reset}>Thử lại</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/vi/admin')}
          >
            Về Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
