'use client'

import { useState } from 'react'

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { useDocsConfig } from '@/lib/core/hooks/use-docs-config'
import { getObjectValueByLocale } from '@/lib/core/utils/locale'
import { DocsSidebarNav } from './docs/sidebar-nav'
import { ScrollArea } from './ui/scroll-area'
import { Icons } from '@/components/icons'
import { blogConfig } from '@/config/blog'
import { siteConfig } from '@/config/site'
import { usePathname } from '@/navigation'
import { MobileLink } from './mobile-link'
import { Button } from './ui/button'

interface MobileNavProps {
  menuLinks: React.ReactElement

  messages: {
    menu: string
    toggleMenu: string
  }
}

export function MobileNav({ messages, menuLinks }: MobileNavProps) {
  const pathname = usePathname()
  const docsConfig = useDocsConfig()
  const [open, setOpen] = useState(false)

  const shouldDisplayDocsSidebarContent = pathname.startsWith('/docs')

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          variant="ghost"
        >
          <Icons.menu className="size-5" />
          <span className="sr-only">${messages.toggleMenu}</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="pr-0" side="left">
        <SheetTitle className="sr-only">{messages.menu}</SheetTitle>

        <MobileLink
          className="flex items-center"
          href="/"
          onOpenChange={setOpen}
        >
          <Icons.logo className="mr-2 size-4" />
          <span className="font-bold">{siteConfig.name}</span>
        </MobileLink>

        {menuLinks && (
          <div className="flex sm:hidden flex-col space-y-2 items-end pr-2">
            {menuLinks}
          </div>
        )}

        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {blogConfig.mainNav?.map(item => (
              <MobileLink href="/blog" key={item.href} onOpenChange={setOpen}>
                {getObjectValueByLocale(item.title, docsConfig.currentLocale)}
              </MobileLink>
            ))}

            {docsConfig.docs.mainNav?.map(
              item =>
                item.href && (
                  <MobileLink
                    href={item.href}
                    key={item.href}
                    onOpenChange={setOpen}
                  >
                    {getObjectValueByLocale(
                      item.title,
                      docsConfig.currentLocale
                    )}
                  </MobileLink>
                )
            )}
          </div>

          <div className="flex flex-col space-y-2">
            {shouldDisplayDocsSidebarContent && (
              <DocsSidebarNav
                handleMobileSidebar={setOpen}
                isMobile
                items={docsConfig.docs.sidebarNav}
                locale={docsConfig.currentLocale}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
