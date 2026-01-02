import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

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

export async function generateStaticParams() {
  return []
}

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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params
  const project = await getProjectBySlug(slug, locale)

  if (!project) {
    notFound()
  }

  return (
    <article className="container relative py-10">
      <ProjectHeader project={project} />

      {project.project_media && project.project_media.length > 0 && (
        <section className="mt-12">
          <ProjectGallery media={project.project_media} />
        </section>
      )}

      <div className="mx-auto mt-16 max-w-4xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <ProjectInfo project={project} />
          </aside>

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
