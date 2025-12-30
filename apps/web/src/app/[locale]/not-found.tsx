import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('not_found')

  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-4 py-10 text-center">
      <h1 className="text-5xl font-bold">404</h1>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Button asChild>
        <Link href="/">{t('back_home')}</Link>
      </Button>
    </div>
  )
}
