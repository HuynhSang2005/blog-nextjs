import { useLocale } from 'next-intl'
import { defaultLocale } from '@/config/i18n'
import type { BlogConfig } from '@/lib/core/types/blog'
import type { LocaleOptions } from '../types/i18n'
import { blogConfig as staticBlogConfig } from '@/config/blog'

export function useBlogConfig() {
  const locale = useLocale() as LocaleOptions
  const currentLocale = locale || defaultLocale

  return {
    currentLocale,
    blog: staticBlogConfig,
  } as { currentLocale: LocaleOptions; blog: BlogConfig }
}
