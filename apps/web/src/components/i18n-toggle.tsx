'use client'

import { ChevronDown, LanguagesIcon } from 'lucide-react'
import { usePathname, useRouter } from '@/navigation'
import { type PointerEvent, useState } from 'react'
import { useLocale } from 'next-intl'

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useIsMobile } from '@/lib/core/hooks/use-is-mobile'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import { Button } from '@/components/ui/button'
import { labels } from '@/config/i18n'

interface I18nToggleProps {
  messages: {
    toggleLanguage: string
  }
}

const locales = Object.entries(labels)

export function I18nToggle({ messages }: I18nToggleProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const currentLocale = useLocale()

  const [open, setOpen] = useState(false)

  function openDropdown() {
    setOpen(() => true)
  }

  function closeDropdown(element: PointerEvent<HTMLElement>) {
    const target = element.relatedTarget as Element

    if ('closest' in target && target.closest('[role=menu]')) return

    setOpen(() => false)
  }

  function changeLocale(locale: LocaleOptions) {
    router.replace(pathname, {
      locale,
    })
  }

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-expanded={open}
          className="group pointer-events-auto relative flex w-fit gap-1 px-2"
          onClick={() => isMobile && openDropdown()}
          onPointerEnter={() => !isMobile && openDropdown()}
          onPointerLeave={event => !isMobile && closeDropdown(event)}
          variant="ghost"
        >
          <LanguagesIcon className="size-[1.2rem] transition-all dark:rotate-0 dark:scale-100" />

          <ChevronDown className="size-3 transition duration-300 group-aria-expanded:rotate-180" />

          <span className="sr-only">{messages.toggleLanguage}</span>
          <span className="pointer-events-auto absolute z-10 block h-14 w-full" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="flex flex-col items-center"
        onCloseAutoFocus={e => e.preventDefault()}
        onPointerLeave={closeDropdown}
        role="menu"
      >
        <div className="w-full">
          {locales.map(([locale, label]) => (
            <DropdownMenuItem
              disabled={currentLocale === locale}
              key={locale}
              onClick={() => changeLocale(locale as LocaleOptions)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
