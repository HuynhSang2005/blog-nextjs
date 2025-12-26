import vi from '@/i18n/locales/vi.json'
import { absoluteUrl } from '@/lib/utils'

export const siteConfig = {
  name: 'huynhsang.dev',

  description: {
    vi: vi.site.description,
  },

  url: process.env.NEXT_PUBLIC_APP_URL,

  og: {
    image: absoluteUrl('/og.jpg'),

    size: {
      width: 1200,
      height: 630,
    },
  },

  app: {
    latestVersion: '1.0.0',
  },

  author: {
    name: 'Huỳnh Sang',
    site: 'https://github.com/HuynhSang2005',
  },

  links: {
    twitter: {
      label: 'Twitter',
      username: '@huynhsang',
      url: 'https://twitter.com/huynhsang',
    },

    github: {
      label: 'GitHub',
      url: 'https://github.com/HuynhSang2005/blog-nextjs',
    },
  },
} as const

export type SiteConfig = typeof siteConfig
