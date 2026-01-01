import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ExternalLink, Github, Calendar, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getTranslations } from 'next-intl/server'

interface ProjectHeaderProps {
  project: {
    id: string
    title: string
    slug: string
    description: string | null
    status: 'in_progress' | 'completed' | 'archived' | null
    start_date: string | null
    end_date: string | null
    demo_url: string | null
    github_url: string | null
    project_tags?: Array<{
      tag: {
        id: string
        name: string
        slug: string
        color: string | null
      }
    }> | null
  }
}

export async function ProjectHeader({ project }: ProjectHeaderProps) {
  const t = await getTranslations('projects.detail')

  // Format date range
  const dateRange = formatDateRange(
    project.start_date,
    project.end_date,
    t('present')
  )

  // Get status badge variant and label
  const statusConfig = getStatusConfig(project.status)

  return (
    <header className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link className="hover:text-foreground transition-colors" href="/vi">
          {t('breadcrumb_home')}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          className="hover:text-foreground transition-colors"
          href="/vi/projects"
        >
          {t('breadcrumb_projects')}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{project.title}</span>
      </nav>

      {/* Project Title */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {project.title}
          </span>
        </h1>

        {/* Description */}
        {project.description && (
          <p className="text-xl text-muted-foreground max-w-3xl">
            {project.description}
          </p>
        )}
      </div>

      {/* Metadata Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Badge */}
        {project.status && (
          <Badge className="gap-1.5" variant={statusConfig.variant}>
            <statusConfig.icon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>
        )}

        {/* Date Range */}
        {dateRange && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{dateRange}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {project.project_tags && project.project_tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.project_tags.map(({ tag }) => (
            <Badge
              className="hover:bg-secondary/80 transition-colors"
              key={tag.id}
              style={
                tag.color
                  ? {
                      borderColor: tag.color,
                      backgroundColor: `${tag.color}15`,
                    }
                  : undefined
              }
              variant="secondary"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {(project.demo_url || project.github_url) && (
        <>
          <Separator className="my-6" />
          <div className="flex flex-wrap gap-4">
            {project.demo_url && (
              <Button asChild className="gap-2" size="lg">
                <a
                  href={project.demo_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('view_demo')}
                </a>
              </Button>
            )}

            {project.github_url && (
              <Button asChild className="gap-2" size="lg" variant="outline">
                <a
                  href={project.github_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="h-4 w-4" />
                  {t('view_code')}
                </a>
              </Button>
            )}
          </div>
        </>
      )}
    </header>
  )
}

/**
 * Format date range for project duration
 */
function formatDateRange(
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
 * Get status badge configuration
 */
function getStatusConfig(
  status: 'in_progress' | 'completed' | 'archived' | null
) {
  const StatusIcon = ({ className }: { className?: string }) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className={className}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </span>
        )
      case 'completed':
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Hoàn thành</title>
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        )
      case 'archived':
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Đã lưu trữ</title>
            <path
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        )
      default:
        return null
    }
  }

  switch (status) {
    case 'in_progress':
      return {
        variant: 'secondary' as const,
        label: 'Đang phát triển',
        icon: StatusIcon,
      }
    case 'completed':
      return {
        variant: 'default' as const,
        label: 'Hoàn thành',
        icon: StatusIcon,
      }
    case 'archived':
      return {
        variant: 'outline' as const,
        label: 'Đã lưu trữ',
        icon: StatusIcon,
      }
    default:
      return {
        variant: 'secondary' as const,
        label: 'Không xác định',
        icon: StatusIcon,
      }
  }
}
