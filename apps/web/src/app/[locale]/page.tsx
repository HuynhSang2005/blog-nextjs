import { setRequestLocale, getTranslations } from 'next-intl/server'

import {
  PageHeader,
  PageActions,
  PageHeaderHeading,
  PageHeaderDescription,
} from '@/components/page-header'

import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { InstallationBox } from '@/components/installation-box'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import { Announcement } from '@/components/announcement'
import { buttonVariants } from '@/components/ui/button'
import { FlipWords } from '@/components/ui/flip-words'
import { Vortex } from '@/components/vortex'
import { Icons } from '@/components/icons'
import { siteConfig } from '@/config/site'
import { Link } from '@/navigation'
import { cn } from '@/lib/utils'
import { defaultLocale, locales } from '@/config/i18n'

export const dynamicParams = true

export default async function IndexPage(props: {
  params: Promise<{ locale: LocaleOptions }>
}) {
  const params = await props.params
  const currentLocale = locales.includes(params.locale)
    ? params.locale
    : defaultLocale
  setRequestLocale(currentLocale)

  const t = await getTranslations('site')

  return (
    <div className="container relative">
      <PageHeader>
        <Announcement href="/docs" title={t('announcement')} />

        <PageHeaderHeading>
          <FlipWords
            className="text-9xl -z-10 mb-12 md:mb-10"
            words={['Site', 'Blog', 'Docs']}
          />

          <TextGenerateEffect words={t('heading')} />
        </PageHeaderHeading>

        <PageHeaderDescription>{t('description')}</PageHeaderDescription>

        <PageActions className="flex-wrap gap-3 sm:gap-0">
          <Link className={cn(buttonVariants())} href="/docs">
            {t('buttons.get_started')}
          </Link>

          <Link
            className={cn(buttonVariants({ variant: 'outline' }))}
            href={siteConfig.links.github.url}
            rel="noreferrer"
            target="_blank"
            title={siteConfig.links.github.label}
          >
            <Icons.gitHub className="mr-2 size-4" />
            {siteConfig.links.github.label}
          </Link>
        </PageActions>

        <InstallationBox
          __rawString__="npx degit HuynhSang2005/blog-nextjs project_name"
          className="w-full relative max-w-140 flex flex-wrap items-center pl-4! pr-12! mb-[6px]"
        />

        <div className="w-full text-center my-2 font-semibold text-sm">
          "Sử dụng NPM hoặc BunJS"
        </div>

        <InstallationBox
          __rawString__="bunx degit HuynhSang2005/blog-nextjs project_name"
          className="w-full relative max-w-140 flex flex-wrap items-center pl-4! pr-12! mt-[4px]"
        />

        <div className="fixed left-0 -top-40 size-full -z-10 overflow-hidden">
          <Vortex
            backgroundColor="transparent"
            baseRadius={2}
            className="flex size-full"
            particleCount={20}
            rangeSpeed={1.5}
            rangeY={300}
          />
        </div>
      </PageHeader>

      {/* <section className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          <FeaturedCard
            description={t('featured_cards.nextjs.description')}
            icon="🧬"
            title="Next.js"
          />

          <FeaturedCard
            description={t('featured_cards.shadcn.description')}
            icon="⚡️"
            title="Shadcn"
          />

          <FeaturedCard
            description={t('featured_cards.tailwind.description')}
            icon="🚀"
            title="Tailwind"
          />

          <FeaturedCard
            description={t('featured_cards.i18n.description')}
            icon="🌍"
            title="i18n"
          />
        </div>

        <FeaturedCard
          description={t('featured_cards.more.description')}
          icon="+"
          orientation="horizontal"
          title={t('featured_cards.more.title')}
        />
      </section> */}
    </div>
  )
}
