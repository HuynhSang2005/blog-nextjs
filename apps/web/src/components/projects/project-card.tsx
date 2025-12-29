'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CldImage } from 'next-cloudinary'
import { ExternalLink, Github, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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

interface ProjectCardProps {
  project: Project
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

  // Extract tags (first 3 only)
  const tags = project.project_tags
    ?.map((pt) => pt.tag)
    .filter((tag): tag is NonNullable<typeof tag> => tag !== null)
    .slice(0, 3)

  return (
    <Link
      href={`/${locale}/projects/${project.slug}`}
      className={cn(
        'group relative overflow-hidden rounded-lg',
        'transition-all duration-300',
        'hover:shadow-2xl hover:shadow-primary/20',
        sizeClasses[size]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className="relative h-full w-full">
        {/* Cover Image */}
        {project.cover_media ? (
          <div className="absolute inset-0">
            <CldImage
              src={project.cover_media.public_id}
              alt={project.cover_media.alt_text || project.title}
              fill
              className={cn(
                'object-cover transition-transform duration-500',
                isHovered && 'scale-110'
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
              variant="secondary"
              className="gap-1 border-primary/20 bg-primary/10 backdrop-blur-sm"
            >
              <Star className="h-3 w-3 fill-primary text-primary" />
              Nổi bật
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-sm"
                  style={{
                    borderColor: tag.color || undefined,
                  }}
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
                ? 'Đang phát triển'
                : project.status === 'completed'
                  ? 'Hoàn thành'
                  : 'Lưu trữ'}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {project.demo_url && (
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  Demo
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
