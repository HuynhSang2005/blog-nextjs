import { setRequestLocale } from 'next-intl/server'

import { getServerDocsConfig } from '@/lib/core/utils/get-server-docs-config'
import { DocsSidebarNav } from '@/components/docs/sidebar-nav'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DocsLayoutProps {
  children: React.ReactNode
  params: Promise<{
    locale: LocaleOptions
  }>
}

export const dynamicParams = true

export default async function DocsLayout(props: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const params = await props.params

  const docsProps: DocsLayoutProps = {
    children: props.children,
    params: Promise.resolve({ locale: params.locale as LocaleOptions }),
  }

  const typedParams = await docsProps.params
  const locale = typedParams.locale

  const { children } = props

  setRequestLocale(locale)

  const docsConfig = await getServerDocsConfig({ locale })

  return (
    <div className="border-b">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="h-max-[calc(100vh-3.5rem)] fixed top-14 z-30 -ml-2 hidden w-full shrink-0 md:sticky md:block">
          <ScrollArea className="h-max-[calc(100vh-3.5rem)] h-full min-h-fit py-6 pr-6 lg:py-8">
            <DocsSidebarNav
              items={docsConfig.docs.sidebarNav}
              locale={docsConfig.currentLocale}
            />
          </ScrollArea>
        </aside>

        {children}
      </div>
    </div>
  )
}
