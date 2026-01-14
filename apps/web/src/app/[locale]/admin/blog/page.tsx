import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/admin/table-skeleton'
import { BlogPostsTable } from '@/components/admin/blog/posts-table'
import { getBlogPosts } from '@/services/blog-service'

interface BlogPostsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    search?: string
    status?: 'draft' | 'published' | 'archived' | 'all'
    from?: string
    to?: string
    page?: string
  }>
}

export default async function BlogPostsPage({
  params,
  searchParams,
}: BlogPostsPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.blog')

  const sp = await searchParams
  const page = Number.parseInt(sp.page ?? '1', 10)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1

  const status = sp.status && sp.status !== 'all' ? sp.status : null
  const search = sp.search ?? ''
  const dateFrom = sp.from ?? ''
  const dateTo = sp.to ?? ''

  const { data: posts, pagination } = await getBlogPosts(
    locale,
    status as any,
    { page: safePage, pageSize: 20 },
    {
      search: search || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/admin/blog/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create')}
          </Link>
        </Button>
      </div>

      {/* Blog Posts Table */}
      <Suspense fallback={<TableSkeleton />}>
        <BlogPostsTable
          data={posts}
          initialSearch={search}
          initialStatus={(sp.status ?? 'all') as any}
          locale={locale}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      </Suspense>
    </div>
  )
}
