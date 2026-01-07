'use client'

import { ProjectCard } from './project-card'
import type { ProjectListItem } from '@/types/supabase-helpers'

interface ProjectsGridProps {
  projects: ProjectListItem[]
  locale: string
}

// Helper function để get dynamic card size
function getCardSize(
  index: number,
  featured: boolean
): 'small' | 'medium' | 'wide' | 'large' {
  if (featured) return 'large'

  // Pattern for variety
  const pattern = [
    'medium',
    'small',
    'small',
    'small',
    'wide',
    'medium',
    'small',
    'wide',
  ]
  return pattern[index % pattern.length] as
    | 'small'
    | 'medium'
    | 'wide'
    | 'large'
}

export function ProjectsGrid({ projects, locale }: ProjectsGridProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => {
        const size = getCardSize(index, project.featured || false)

        return (
          <ProjectCard
            key={project.id}
            locale={locale}
            project={project}
            size={size}
          />
        )
      })}
    </div>
  )
}
