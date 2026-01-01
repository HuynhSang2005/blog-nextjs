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
import { getProjects } from '@/lib/queries/projects'
import { getTranslations } from 'next-intl/server'

async function ProjectsTableWrapper({ locale }: { locale: string }) {
  const projects = await getProjects(locale)

  return <ProjectsTable projects={projects} />
}

interface ProjectsPageProps {
  params: Promise<{ locale: string }>
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.projects')

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
            <ProjectsTableWrapper locale={locale} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
