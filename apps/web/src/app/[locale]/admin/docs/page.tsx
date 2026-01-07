import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocsAdminListPaginated, getDocsTopics } from '@/services/docs-service'
import { DocsTable } from '@/components/admin/docs/docs-table'

interface AdminDocsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    search?: string
    topic?: string
    from?: string
    to?: string
    page?: string
  }>
}

export default async function AdminDocsPage({
  params,
  searchParams,
}: AdminDocsPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.docs')

  const sp = await searchParams
  const page = Number.parseInt(sp.page ?? '1', 10)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1

  const search = sp.search ?? ''
  const topic = sp.topic ?? ''
  const dateFrom = sp.from ?? ''
  const dateTo = sp.to ?? ''

  const [topics, docsRes] = await Promise.all([
    getDocsTopics(),
    getDocsAdminListPaginated({
      pagination: { page: safePage, pageSize: 20 },
      filters: {
        search: search || undefined,
        topicSlug: topic || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      },
    }),
  ])

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
        <DocsTable
          data={docsRes.data}
          initialSearch={search}
          initialTopic={topic}
          page={docsRes.pagination.page}
          topics={topics.map(t => ({ name: t.name, slug: t.slug }))}
          totalPages={docsRes.pagination.totalPages}
        />
      </Suspense>
    </div>
  )
}
