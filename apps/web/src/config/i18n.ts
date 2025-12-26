import type { Locales, LocalizedRecord } from '@/lib/core/types/i18n'

export const defaultLocale = 'vi' as const

export const locale = {
  vi: defaultLocale,
} as const

export const labels = {
  [defaultLocale]: 'Tiếng Việt',
} as const

export const dateLocales: LocalizedRecord = {
  vi: 'vi-VN',
} as const

export const locales = Object.values(locale) as Locales
