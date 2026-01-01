import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TableSkeleton } from '@/components/admin/table-skeleton'
import { BlogPostsTable } from '@/components/admin/blog/posts-table'
import { getBlogPosts } from '@/lib/queries/blog'

interface BlogPostsPageProps {
  params: Promise<{ locale: string }>
}

export default async function BlogPostsPage({ params }: BlogPostsPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.blog')

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
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <BlogPostsTableWrapper locale={locale} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

async function BlogPostsTableWrapper({ locale }: { locale: string }) {
  const posts = await getBlogPosts()
  return <BlogPostsTable data={posts} locale={locale} />
}
