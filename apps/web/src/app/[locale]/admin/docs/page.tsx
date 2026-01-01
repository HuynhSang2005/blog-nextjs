import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocsAdminList } from '@/lib/queries/docs'
import { DocsTable } from '@/components/admin/docs/docs-table'

async function DocsTableWrapper() {
  const docs = await getDocsAdminList()
  return <DocsTable data={docs} />
}

interface AdminDocsPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminDocsPage({ params }: AdminDocsPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.docs')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <Button asChild>
          <Link href={`/${locale}/admin/docs/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create')}
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>{t('messages.loading')}</div>}>
        <DocsTableWrapper />
      </Suspense>
    </div>
  )
}
