import { type Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getProjects, getProjectStats } from '@/app/actions/projects-queries'
import { PageHeader } from '@/components/page-header'
import { ProjectsGrid } from '@/components/projects/projects-grid'
import { ProjectFilters } from '@/components/projects/project-filters'

interface ProjectsPageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    status?: 'in_progress' | 'completed' | 'archived'
    featured?: string
  }>
}

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

  // Fetch projects với filters
  const projects = await getProjects(locale, {
    status: search.status,
    featured: search.featured === 'true' ? true : undefined,
  })

  // Fetch stats cho filter badges
  const stats = await getProjectStats(locale)

  return (
    <div className="container relative">
      {/* Header Section */}
      <PageHeader
        heading={t('heading')}
        text={t('subheading')}
        className="pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16"
      />

      {/* Filter Bar */}
      <ProjectFilters stats={stats} />

      {/* Projects Grid */}
      <div className="py-12">
        {projects.length > 0 ? (
          <ProjectsGrid projects={projects} locale={locale} />
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
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
