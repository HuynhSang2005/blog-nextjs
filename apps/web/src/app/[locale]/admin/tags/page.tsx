import { getTranslations } from 'next-intl/server'
import { getTagsAdminList } from '@/app/actions/tags'
import { TagsClient } from './tags-client'

interface TagsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    slug?: string
    from?: string
    to?: string
    page?: string
  }>
}

export default async function TagsPage({
  params,
  searchParams,
}: TagsPageProps) {
  const { locale: _locale } = await params
  const t = await getTranslations('admin.tags')

  const sp = await searchParams
  const page = Number.parseInt(sp.page ?? '1', 10)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1

  const slug = sp.slug ?? ''
  const dateFrom = sp.from ?? ''
  const dateTo = sp.to ?? ''

  const res = await getTagsAdminList({
    pagination: { page: safePage, pageSize: 20 },
    filters: {
      slug: slug || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <TagsClient
        initialSlug={slug}
        page={res.pagination.page}
        tags={res.data}
        totalItems={res.pagination.totalItems}
        totalPages={res.pagination.totalPages}
      />
    </div>
  )
}
