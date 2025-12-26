import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'

import { Icons } from '@/components/icons'
import { MainNav } from '@/components/main-nav'
import { MobileNav } from '@/components/mobile-nav'
import { ThemeModeToggle } from '@/components/theme-mode-toggle'
import { Separator } from '@/components/ui/separator'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { Link } from '@/navigation'
import { I18nToggle } from './i18n-toggle'
import { buttonVariants } from './ui/button'
import { VersionDropdown } from './version-dropdown'

const CommandMenu = dynamic(() =>
  import('@/components/command-menu').then(mod => mod.CommandMenu)
)

export async function SiteHeader() {
  const t = await getTranslations('site')

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav
          messages={{
            docs: t('words.docs'),
            blog: t('words.blog'),
          }}
        />

        <MobileNav
          menuLinks={<SiteHeaderMenuLinks />}
          messages={{
            menu: t('words.menu'),
            toggleMenu: t('buttons.toggle_menu'),
          }}
        />

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu
              messages={{
                docs: t('words.docs'),
                blog: t('words.blog'),
                search: t('search.search'),
                noResultsFound: t('search.no_results_found'),
                typeCommandOrSearch: t('search.type_command_or_search'),
                searchDocumentation: t('search.search_documentation'),

                themes: {
                  dark: t('themes.dark'),
                  theme: t('themes.theme'),
                  light: t('themes.light'),
                  system: t('themes.system'),
                },
              }}
            />
          </div>

          <nav className="flex items-center">
            <VersionDropdown
              messages={{
                changelog: t('changelog'),
              }}
            />

            <I18nToggle
              messages={{
                toggleLanguage: t('buttons.toggle_language'),
              }}
            />

            <ThemeModeToggle
              messages={{
                dark: t('themes.dark'),
                light: t('themes.light'),
                system: t('themes.system'),
              }}
            />

            <div className="phone:flex hidden items-center">
              <Separator className="mx-1 h-5" orientation="vertical" />
              <SiteHeaderMenuLinks />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export function SiteHeaderMenuLinks() {
  return (
    <Link href={siteConfig.links.github.url} rel="noreferrer" target="_blank">
      <div
        className={cn(
          buttonVariants({
            variant: 'ghost',
          }),
          'w-9 px-0'
        )}
      >
        <Icons.gitHub className="size-4" />
        <span className="sr-only">GitHub</span>
      </div>
    </Link>
  )
}
