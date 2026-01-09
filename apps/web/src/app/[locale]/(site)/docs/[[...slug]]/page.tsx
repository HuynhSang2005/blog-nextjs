import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { LocaleOptions } from '@/types/i18n'
import type { Metadata } from 'next'

import '@/styles/mdx.css'

import { DocumentNotFound } from '@/components/docs/not-found'
import { defaultLocale } from '@/config/i18n'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { getPublicDocBySlug } from '@/services/docs-service'
import { PublicDocPage } from '@/features/docs'

// Revalidate every 60 minutes (Phase 2: Runtime caching)
export const revalidate = 3600

export const dynamicParams = true

export async function generateMetadata(props: {
  params: Promise<{ locale?: string; slug?: string[] }>
}): Promise<Metadata> {
  const params = await props.params
  const locale = params.locale || defaultLocale

  setRequestLocale(locale)

  const doc = await getPublicDocBySlug({
    locale,
    slugParts: params.slug,
  })

  if (!doc) {
    return {}
  }

  const docSlug = params.slug?.join('/') || ''
  const urlPath = docSlug ? `/${locale}/docs/${docSlug}` : `/${locale}/docs`

  return {
    title: doc.title,
    description: doc.description || undefined,

    openGraph: {
      type: 'article',
      title: doc.title,
      url: absoluteUrl(urlPath),
      description: doc.description || undefined,

      images: [
        {
          ...siteConfig.og.size,
          url: siteConfig.og.image,
          alt: siteConfig.name,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description: doc.description || undefined,
      images: [siteConfig.og.image],
      creator: siteConfig.links.twitter.username,
    },
  }
}

export default async function DocPage(props: {
  params: Promise<{ locale?: string; slug?: string[] }>
}) {
  const params = await props.params
  const locale = (params.locale || defaultLocale) as LocaleOptions
  setRequestLocale(locale)

  const doc = await getPublicDocBySlug({
    locale,
    slugParts: params.slug,
  })
  const t = await getTranslations('docs')

  if (!doc) {
    return (
      <DocumentNotFound
        messages={{
          title: t('not_found.title'),
          description: t('not_found.description'),
        }}
      />
    )
  }

  const slugPath = params.slug?.join('/') || ''

  return (
    <PublicDocPage
      doc={doc}
      locale={locale}
      messages={{
        docs: t('docs'),
        onThisPage: t('on_this_page'),
        editPageOnGitHub: t('edit_page_on_github'),
        startDiscussionOnGitHub: t('start_discussion_on_github'),
      }}
      slugPath={slugPath}
    />
  )
}
