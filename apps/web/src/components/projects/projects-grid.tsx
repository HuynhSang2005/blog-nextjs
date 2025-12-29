'use client'

import { useState } from 'react'
import { ProjectCard } from './project-card'
import type { Database } from '@/lib/supabase/database.types'

type Project = Database['public']['Tables']['projects']['Row'] & {
  cover_media?: {
    public_id: string
    alt_text: string | null
    width: number | null
    height: number | null
  } | null
  project_tags?: Array<{
    tag: {
      id: string
      name: string
      slug: string
      color: string | null
    } | null
  }>
  project_tech_stack?: Array<{
    name: string
    category: string
    icon: string | null
    order_index: number
  }>
}

interface ProjectsGridProps {
  projects: Project[]
  locale: string
}

// Helper function để get dynamic card size
function getCardSize(index: number, featured: boolean): 'small' | 'medium' | 'wide' | 'large' {
  if (featured) return 'large'
  
  // Pattern for variety
  const pattern = ['medium', 'small', 'small', 'small', 'wide', 'medium', 'small', 'wide']
  return pattern[index % pattern.length] as 'small' | 'medium' | 'wide' | 'large'
}

export function ProjectsGrid({ projects, locale }: ProjectsGridProps) {
  return (
    <div className="grid auto-rows-auto grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => {
        const size = getCardSize(index, project.featured || false)
        
        return (
          <ProjectCard
            key={project.id}
            project={project}
            size={size}
            locale={locale}
          />
        )
      })}
    </div>
  )
}
