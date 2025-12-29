import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ExternalLink, Github } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getTranslations } from 'next-intl/server'

interface ProjectInfoProps {
  project: {
    id: string
    status: 'in_progress' | 'completed' | 'archived' | null
    start_date: string | null
    end_date: string | null
    demo_url: string | null
    github_url: string | null
    project_tech_stack?: Array<{
      name: string
      category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'other' | null
      icon: string | null
      order_index: number | null
    }> | null
  }
}

export async function ProjectInfo({ project }: ProjectInfoProps) {
  const t = await getTranslations('projects.detail')

  // Group technologies by category
  const techByCategory = groupTechByCategory(project.project_tech_stack || [])

  // Format duration
  const duration = formatDuration(project.start_date, project.end_date, t('present'))

  // Get status label
  const statusLabel = getStatusLabel(project.status)

  return (
    <div className="space-y-8">
      {/* Metadata Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Thông tin dự án</h2>

        <div className="space-y-3">
          {/* Status */}
          {project.status && (
            <div className="flex items-start justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{t('status_label')}</span>
              <span className="font-medium text-right">{statusLabel}</span>
            </div>
          )}

          {/* Duration */}
          {duration && (
            <div className="flex items-start justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{t('duration_label')}</span>
              <span className="font-medium text-right">{duration}</span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Technologies Section */}
      {techByCategory.length > 0 && (
        <>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t('tech_heading')}</h2>

            <div className="space-y-6">
              {techByCategory.map(({ category, techs }) => (
                <div key={category} className="space-y-2">
                  {/* Category Heading */}
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {getCategoryLabel(category)}
                  </h3>

                  {/* Technology Badges */}
                  <div className="flex flex-wrap gap-2">
                    {techs.map((tech, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="gap-1.5"
                      >
                        {tech.icon && (
                          <span className="text-xs">{tech.icon}</span>
                        )}
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Links Section */}
      {(project.demo_url || project.github_url) && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('links_heading')}</h2>

          <div className="space-y-2">
            {project.demo_url && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('demo_link')}
                </a>
              </Button>
            )}

            {project.github_url && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  {t('github_link')}
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Group technologies by category
 */
function groupTechByCategory(
  techStack: Array<{
    name: string
    category: string | null
    icon: string | null
    order_index: number | null
  }>
) {
  // Sort by order_index first
  const sorted = [...techStack].sort(
    (a, b) => (a.order_index || 0) - (b.order_index || 0)
  )

  // Group by category
  const grouped = sorted.reduce((acc, tech) => {
    const category = tech.category || 'other'
    const existing = acc.find((item) => item.category === category)

    if (existing) {
      existing.techs.push(tech)
    } else {
      acc.push({
        category,
        techs: [tech],
      })
    }

    return acc
  }, [] as Array<{ category: string; techs: typeof techStack }>)

  // Sort categories by predefined order
  const categoryOrder = [
    'frontend',
    'backend',
    'database',
    'devops',
    'tools',
    'other',
  ]

  return grouped.sort(
    (a, b) =>
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
  )
}

/**
 * Format duration string
 */
function formatDuration(
  startDate: string | null,
  endDate: string | null,
  presentLabel: string
): string | null {
  if (!startDate) return null

  const start = format(parseISO(startDate), 'MMMM yyyy', { locale: vi })

  if (!endDate) {
    return `${start} - ${presentLabel}`
  }

  const end = format(parseISO(endDate), 'MMMM yyyy', { locale: vi })
  return `${start} - ${end}`
}

/**
 * Get status label in Vietnamese
 */
function getStatusLabel(
  status: 'in_progress' | 'completed' | 'archived' | null
): string {
  switch (status) {
    case 'in_progress':
      return 'Đang phát triển'
    case 'completed':
      return 'Hoàn thành'
    case 'archived':
      return 'Đã lưu trữ'
    default:
      return 'Không xác định'
  }
}

/**
 * Get category label in Vietnamese
 */
function getCategoryLabel(category: string): string {
  switch (category) {
    case 'frontend':
      return 'Frontend'
    case 'backend':
      return 'Backend'
    case 'database':
      return 'Cơ sở dữ liệu'
    case 'devops':
      return 'DevOps'
    case 'tools':
      return 'Công cụ'
    case 'other':
      return 'Khác'
    default:
      return category
  }
}
