import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TableSkeleton } from '@/components/admin/table-skeleton'
import { DocsTable } from '@/components/admin/docs/docs-table'
import { getAllDocs } from '@/lib/supabase/queries/docs'

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('admin.docs')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
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

      {/* Docs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <DocsTableWrapper locale={locale} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function DocsTableWrapper({ locale }: { locale: string }) {
  const { data: docs } = await getAllDocs(locale, undefined, { page: 1, pageSize: 100 })
  return <DocsTable data={docs || []} locale={locale} />
}
