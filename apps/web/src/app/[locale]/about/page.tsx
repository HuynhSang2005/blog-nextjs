import { notFound } from 'next/navigation'
import { getAboutData } from '@/app/actions/about'
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header'
import { BioSection } from '@/components/about/bio-section'
import { Timeline } from '@/components/about/timeline'
import { SkillsGrid } from '@/components/about/skills-grid'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

type AboutPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        vi: '/vi/about',
        en: '/en/about',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'profile',
      url: `/${locale}/about`,
    },
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  // Fetch all about data
  const data = await getAboutData(locale)

  // Get bio section
  const bioSection = data.sections.find(s => s.section_key === 'bio')

  // If no data at all, show not found
  if (
    !data.sections?.length &&
    !data.timeline?.length &&
    !data.skills?.length
  ) {
    notFound()
  }

  return (
    <div className="container py-10">
      {/* Page Header */}
      <PageHeader>
        <PageHeaderHeading>{t('heading')}</PageHeaderHeading>
        <PageHeaderDescription>{t('subheading')}</PageHeaderDescription>
      </PageHeader>

      {/* Bio Section */}
      {bioSection && data.profile && (
        <BioSection
          content={bioSection.content}
          locale={locale}
          profile={data.profile}
        />
      )}

      {/* Timeline Section */}
      {data.timeline && data.timeline.length > 0 && (
        <section className="mt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">{t('timeline.title')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('timeline.description')}
            </p>
          </div>
          <Timeline events={data.timeline} />
        </section>
      )}

      {/* Skills Section */}
      {data.skills && data.skills.length > 0 && (
        <section className="mt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">{t('skills.title')}</h2>
            <p className="mt-2 text-muted-foreground">
              {t('skills.description')}
            </p>
          </div>
          <SkillsGrid skills={data.skills} />
        </section>
      )}
    </div>
  )
}
