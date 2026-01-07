'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { CldImage } from 'next-cloudinary'
import { ExternalLink, Github, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProjectListItem } from '@/types/supabase-helpers'

interface ProjectCardProps {
  project: ProjectListItem
  size: 'small' | 'medium' | 'wide' | 'large'
  locale: string
}

const sizeClasses = {
  small: 'md:col-span-1 md:row-span-1 aspect-square',
  medium: 'md:col-span-1 md:row-span-1 aspect-[4/5]',
  wide: 'md:col-span-2 md:row-span-1 aspect-video',
  large: 'md:col-span-2 md:row-span-2 aspect-[4/3]',
}

export function ProjectCard({ project, size, locale }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const t = useTranslations('projects')

  // Extract tags (first 3 only)
  const tags = project.tags?.slice(0, 3)

  return (
    <Link
      className={cn(
        'group relative overflow-hidden rounded-lg',
        'transition-all duration-300',
        'hover:shadow-2xl hover:shadow-primary/20',
        sizeClasses[size]
      )}
      href={`/${locale}/projects/${project.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className="relative h-full w-full">
        {/* Cover Image */}
        {project.cover_media ? (
          <div className="absolute inset-0">
            <CldImage
              alt={project.cover_media.alt_text || project.title}
              className={cn(
                'object-cover transition-transform duration-500',
                isHovered && 'scale-110'
              )}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={project.cover_media.public_id}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute right-4 top-4 z-10">
            <Badge
              className="gap-1 border-primary/20 bg-primary/10 backdrop-blur-sm"
              variant="secondary"
            >
              <Star className="h-3 w-3 fill-primary text-primary" />
              {t('filters.featured')}
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  className="bg-background/80 backdrop-blur-sm"
                  key={tag.id}
                  style={{
                    borderColor: tag.color || undefined,
                  }}
                  variant="secondary"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">
            {project.title}
          </h3>

          {/* Description */}
          {project.description && (
            <p className="mb-4 line-clamp-2 text-sm text-white/90 md:text-base">
              {project.description}
            </p>
          )}

          {/* Status Badge */}
          <div className="mb-4">
            <Badge
              variant={
                project.status === 'completed'
                  ? 'default'
                  : project.status === 'in_progress'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {project.status === 'in_progress'
                ? t('filters.in_progress')
                : project.status === 'completed'
                  ? t('filters.completed')
                  : t('filters.archived')}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {project.demo_url && (
              <Button
                asChild
                className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                onClick={e => e.stopPropagation()}
                size="sm"
                variant="secondary"
              >
                <a
                  href={project.demo_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('actions.demo')}
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button
                asChild
                className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                onClick={e => e.stopPropagation()}
                size="sm"
                variant="secondary"
              >
                <a
                  href={project.github_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Github className="h-4 w-4" />
                  {t('actions.github')}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
