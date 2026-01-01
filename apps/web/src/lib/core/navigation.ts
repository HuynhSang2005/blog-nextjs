import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

import { defaultLocale, locales } from '@/config/i18n'

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always include locale in URL
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
