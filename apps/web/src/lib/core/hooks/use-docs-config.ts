import { useLocale } from 'next-intl'
import { defaultLocale } from '@/config/i18n'
import type { DocsConfig } from '@/lib/core/types/docs'
import type { LocaleOptions } from '../types/i18n'
import { docsConfig as staticDocsConfig } from '@/config/docs'

export function useDocsConfig() {
  const locale = useLocale() as LocaleOptions
  const currentLocale = locale || defaultLocale

  return {
    currentLocale,
    docs: staticDocsConfig,
  } as { currentLocale: LocaleOptions; docs: DocsConfig }
}
