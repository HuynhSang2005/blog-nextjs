import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

/**
 * Using next-mdx-remote-client for runtime MDX rendering from database.
 *
 * WHY NOT @next/mdx?
 * - @next/mdx requires .mdx files in app/ directory (file-based routing)
 * - Our content is stored in Supabase database (projects.long_description)
 * - We need runtime rendering of dynamic database strings
 *
 * next-mdx-remote-client is the RECOMMENDED tool for database/CMS content.
 * - Better maintained (active development 2024-2025)
 * - Recommended by Next.js official docs
 * - Enhanced error handling via onError prop
 * - MDX v3 native support
 * - React 19 + Next.js 16 compatible
 *
 * Analysis: docs/dev-v1/MDX-LIBRARY-ANALYSIS.md
 * Last reviewed: December 2025
 * Migrated: December 29, 2025
 * Status: next-mdx-remote-client v2.1.7
 */
import { MDXRemote } from 'next-mdx-remote-client/rsc'
import { getProjectBySlug } from '@/app/actions/projects-queries'
import { ProjectHeader } from '@/components/projects/project-header'
import { ProjectGallery } from '@/components/projects/project-gallery'
import { ProjectInfo } from '@/components/projects/project-info'

interface ProjectPageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

/**
 * Generate static params for all projects (SSG)
 */
export async function generateStaticParams() {
  // NOTE:
  // This route reads projects from Supabase using a cookie-scoped server client.
  // `generateStaticParams()` runs outside a request scope, so Next.js APIs like
  // `cookies()` are not available, which would cause runtime errors.
  // Returning an empty list keeps the route dynamic while avoiding noisy failures
  // in dev/build.
  return []
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const t = await getTranslations({ locale, namespace: 'projects' })
  const project = await getProjectBySlug(slug, locale)

  if (!project) {
    return {
      title: t('not_found.title'),
      description: t('not_found.description'),
    }
  }

  // Get OG image URL from Cloudinary
  const ogImage = project.og_media?.public_id
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${project.og_media.public_id}`
    : project.cover_media?.public_id
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${project.cover_media.public_id}`
      : undefined

  return {
    title: project.title,
    description: project.description || undefined,
    openGraph: {
      title: project.title,
      description: project.description || undefined,
      type: 'article',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: project.og_media?.width || project.cover_media?.width,
              height: project.og_media?.height || project.cover_media?.height,
              alt: project.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description || undefined,
      images: ogImage ? [ogImage] : [],
    },
  }
}

/**
 * Project detail page
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params
  const project = await getProjectBySlug(slug, locale)

  if (!project) {
    notFound()
  }

  return (
    <article className="container relative py-10">
      {/* Project Header */}
      <ProjectHeader project={project} />

      {/* Project Gallery (if images exist) */}
      {project.project_media && project.project_media.length > 0 && (
        <section className="mt-12">
          <ProjectGallery media={project.project_media} />
        </section>
      )}

      {/* Project Info & Description */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Sidebar: Project Info */}
          <aside className="lg:col-span-1">
            <ProjectInfo project={project} />
          </aside>

          {/* Main Content: Long Description */}
          <div className="lg:col-span-2">
            {project.long_description ? (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <MDXRemote source={project.long_description} />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p>Chưa có mô tả chi tiết cho dự án này.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
