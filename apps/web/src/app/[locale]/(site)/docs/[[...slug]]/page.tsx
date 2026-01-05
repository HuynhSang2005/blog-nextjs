import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import type { Metadata } from 'next'

import '@/styles/mdx.css'

import { DashboardTableOfContents } from '@/components/docs/toc'
import { DocumentNotFound } from '@/components/docs/not-found'
import { DocBreadcrumb } from '@/components/docs/breadcrumb'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DocHeading } from '@/components/docs/heading'
import { DocsPager } from '@/components/docs/pager'
import { DocLinks } from '@/components/docs/links'
import { defaultLocale } from '@/config/i18n'
import { MdxRemote } from '@/components/docs/mdx-remote'
import { siteConfig } from '@/config/site'
import { absoluteUrl } from '@/lib/utils'
import { getPublicDocBySlug } from '@/lib/queries/docs'
import type { TableOfContents } from '@/lib/core/utils/toc'
import type { FlatTocItem } from '@/lib/mdx/precompute'

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

/**
 * Convert flat TOC from DB to nested TableOfContents format
 * Phase 1.3D: Use precomputed TOC from database instead of runtime computation
 */
function convertFlatTocToNested(flatToc: FlatTocItem[] | null): TableOfContents {
  if (!flatToc || flatToc.length === 0) {
    return { items: [] }
  }

  // Convert flat items to nested structure
  // For simplicity, we'll use a flat list with url/title format
  // (TOC component can handle both flat and nested)
  const items = flatToc.map(item => ({
    url: `#${item.id}`,
    title: item.value,
    items: [], // Flat structure for now
  }))

  return { items }
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

  // Phase 1.3D: Use precomputed TOC from database (avoids runtime remark parsing)
  const toc = convertFlatTocToNested(doc.toc as FlatTocItem[] | null)
  const slugPath = params.slug?.join('/') || ''
  const docHref = slugPath ? `/docs/${slugPath}` : '/docs'
  const docSlugForPager = slugPath
    ? `/docs/${locale}/${slugPath}`
    : `/docs/${locale}`

  return (
    <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
      <div className="mx-auto w-full min-w-0">
        <DocBreadcrumb
          doc={{
            title: doc.title,
            href: docHref,
          }}
          messages={{
            docs: t('docs'),
          }}
        />

        <DocHeading
          doc={{
            title: doc.title,
            description: doc.description,
            notAvailable: false,
          }}
          locale={locale}
        />
        <DocLinks doc={doc} />

        <div className="pb-12 pt-8">
          <MdxRemote source={doc.content} />
        </div>

        <DocsPager doc={{ slug: docSlugForPager }} locale={locale} />
      </div>

      {doc.show_toc && (
        <div className="hidden text-sm xl:block">
          <div className="sticky top-16 -mt-10 pt-4">
            <ScrollArea className="pb-10">
              <div className="sticky top-16 -mt-10 h-fit py-12">
                <DashboardTableOfContents
                  messages={{
                    onThisPage: t('on_this_page'),
                    editPageOnGitHub: t('edit_page_on_github'),
                    startDiscussionOnGitHub: t('start_discussion_on_github'),
                  }}
                  sourceFilePath=""
                  toc={toc}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </main>
  )
}
