'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const t = useTranslations('error')

  useEffect(() => {
    // Log error to monitoring service (e.g., Sentry, LogRocket)
    console.error('Global error:', error)
    if (error.digest) {
      console.error('Error digest:', error.digest)
    }
  }, [error])

  const handleReset = () => {
    // Attempt to recover by re-rendering the segment
    reset()
    // Also refresh the router to ensure server components re-fetch
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div
            className={cn(
              'rounded-full bg-destructive/10 p-4',
              'animate-in fade-in zoom-in duration-300'
            )}
          >
            <AlertCircle
              aria-hidden="true"
              className="h-12 w-12 text-destructive"
            />
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        {/* Error Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="gap-2" onClick={handleReset} variant="default">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {t('try_again')}
          </Button>
          <Button asChild variant="outline">
            <Link className="gap-2" href="/">
              <Home aria-hidden="true" className="h-4 w-4" />
              {t('go_home')}
            </Link>
          </Button>
        </div>

        {/* Error Details (only in development or when digest exists) */}
        {error.digest && (
          <div
            className={cn(
              'mt-6 p-4 rounded-lg bg-muted text-muted-foreground text-sm',
              'font-mono break-all'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <Bug aria-hidden="true" className="h-4 w-4" />
              <span className="font-semibold">
                {t('digest')}: {error.digest}
              </span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-left">{error.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
