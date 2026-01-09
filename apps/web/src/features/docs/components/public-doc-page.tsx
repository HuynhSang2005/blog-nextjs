import type { LocaleOptions } from '@/types/i18n'

import { DashboardTableOfContents } from '@/components/docs/toc'
import { DocBreadcrumb } from '@/components/docs/breadcrumb'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DocHeading } from '@/components/docs/heading'
import { DocsPager } from '@/components/docs/pager'
import { DocLinks } from '@/components/docs/links'
import { MdxRemote } from '@/components/docs/mdx-remote'

import { convertFlatTocToNested } from '../lib/toc'
import type { PublicDocRecord } from '../types'

export async function PublicDocPage({
  doc,
  locale,
  slugPath,
  messages,
}: {
  doc: PublicDocRecord
  locale: LocaleOptions
  slugPath: string
  messages: {
    docs: string
    onThisPage: string
    editPageOnGitHub: string
    startDiscussionOnGitHub: string
  }
}) {
  const toc = convertFlatTocToNested(doc.toc)

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
            docs: messages.docs,
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
                    onThisPage: messages.onThisPage,
                    editPageOnGitHub: messages.editPageOnGitHub,
                    startDiscussionOnGitHub: messages.startDiscussionOnGitHub,
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
