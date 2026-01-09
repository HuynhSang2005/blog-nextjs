import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getProjectStats } from '@/app/actions/projects-queries'
import { getProjects } from '@/services/project-service'
import {
  PageHeader,
  PageHeaderHeading,
  PageHeaderDescription,
} from '@/components/page-header'
import { ProjectsGrid, ProjectFilters, ProjectsPagination } from '@/features/projects'

interface ProjectsPageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    status?: 'in_progress' | 'completed' | 'archived'
    featured?: string
    q?: string
    page?: string
  }>
}

const PROJECTS_PER_PAGE = 9

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'projects' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const { locale } = await params
  const search = await searchParams
  const t = await getTranslations({ locale, namespace: 'projects' })

  const currentPage = Math.max(1, Number.parseInt(search.page ?? '1', 10) || 1)

  const projectsResult = await getProjects(
    locale,
    search.status,
    {
      page: currentPage,
      pageSize: PROJECTS_PER_PAGE,
    },
    {
      featured: search.featured === 'true' ? true : undefined,
      search: search.q,
    }
  )

  const stats = await getProjectStats(locale)

  return (
    <div className="container relative">
      <PageHeader className="pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
        <PageHeaderHeading>{t('heading')}</PageHeaderHeading>
        <PageHeaderDescription>{t('subheading')}</PageHeaderDescription>
      </PageHeader>

      <ProjectFilters stats={stats} />

      <div className="py-12">
        {projectsResult.data.length > 0 ? (
          <>
            <ProjectsGrid locale={locale} projects={projectsResult.data} />
            {projectsResult.pagination.totalPages > 1 && (
              <ProjectsPagination
                currentPage={projectsResult.pagination.page}
                messages={{
                  next: t('pagination.next'),
                  previous: t('pagination.previous'),
                  go_to_next_page: t('pagination.go_to_next_page'),
                  go_to_previous_page: t('pagination.go_to_previous_page'),
                  go_to_page: t('pagination.go_to_page', { page: '{page}' }),
                  aria_label: t('pagination.aria_label'),
                }}
                searchParams={search}
                totalPages={projectsResult.pagination.totalPages}
              />
            )}
          </>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <svg
                className="text-muted-foreground"
                fill="none"
                height="48"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>{t('empty_state')}</title>
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t('empty_state')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('empty_state_description')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
