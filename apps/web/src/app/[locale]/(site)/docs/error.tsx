'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { RefreshCw, ArrowLeft, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DocsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('error')

  useEffect(() => {
    console.error('Docs error:', error)
    if (error.digest) {
      console.error('Error digest:', error.digest)
    }
  }, [error])

  return (
    <div className="container py-10">
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'min-h-[50vh] space-y-6',
          'animate-in fade-in slide-in-from-bottom-4 duration-300'
        )}
      >
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-500/10 p-4">
            <BookOpen aria-hidden="true" className="h-12 w-12 text-amber-500" />
          </div>
        </div>

        {/* Error Content */}
        <div className="text-center space-y-2 max-w-md">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('docs_title')}
          </h1>
          <p className="text-muted-foreground">{t('docs_description')}</p>
        </div>

        {/* Error Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="gap-2" onClick={reset} variant="default">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {t('try_again')}
          </Button>
          <Button asChild variant="outline">
            <Link className="gap-2" href="/docs">
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              {t('go_home')}
            </Link>
          </Button>
        </div>

        {/* Error Digest */}
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            {t('digest')}: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
