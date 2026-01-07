import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ProjectsTable } from '@/components/admin/projects/projects-table'
import { TableSkeleton } from '@/components/admin/table-skeleton'
import { getProjects } from '@/services/project-service'
import { getTranslations } from 'next-intl/server'

interface ProjectsPageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    search?: string
    status?: 'in_progress' | 'completed' | 'archived' | 'all'
    from?: string
    to?: string
    page?: string
  }>
}

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.projects')

  const sp = await searchParams
  const page = Number.parseInt(sp.page ?? '1', 10)
  const safePage = Number.isFinite(page) && page > 0 ? page : 1

  const status = sp.status && sp.status !== 'all' ? sp.status : null
  const search = sp.search ?? ''
  const dateFrom = sp.from ?? ''
  const dateTo = sp.to ?? ''

  const { data: projects, pagination } = await getProjects(
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button asChild>
          <Link href={`/${locale}/admin/projects/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {t('actions.create')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableSkeleton />}>
            <ProjectsTable
              initialSearch={search}
              initialStatus={(sp.status ?? 'all') as any}
              page={pagination.page}
              projects={projects}
              totalPages={pagination.totalPages}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
