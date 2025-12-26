import type { IntlMessages as Messages } from './src/lib/core/types/i18n'

declare global {
  interface IntlMessages extends Messages {}

  type AbstractIntlMessages = Messages
}
