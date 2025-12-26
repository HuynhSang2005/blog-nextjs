import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import type { Metadata, Viewport } from 'next'

import '@/styles/globals.css'

import { getObjectValueByLocale } from '@/lib/core/utils/locale'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { defaultLocale } from '@/config/i18n'
import { siteConfig } from '@/config/site'
import { getSansFont } from '@/lib/fonts'
import { cn } from '@/lib/utils'

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const params = await props.params

  const locale = (params.locale as LocaleOptions) || defaultLocale
  setRequestLocale(locale)

  return {
    title: {
      default: siteConfig.name,
      template: `%s - ${siteConfig.name}`,
    },

    description: getObjectValueByLocale(siteConfig.description, locale),

    keywords: [
      'Docs',
      'Blog',
      'i18n',
      'React',
      'shadcn',
      'Next.js',
      'Radix UI',
      'Template',
      'Tailwind CSS',
      'Documentation',
      'Server Components',
      'Internationalization',
    ],

    authors: [
      {
        name: siteConfig.author.name,
        url: siteConfig.author.site,
      },
    ],

    creator: siteConfig.author.name,

    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      title: siteConfig.name,
      siteName: siteConfig.name,

      description: getObjectValueByLocale(siteConfig.description, locale),

      images: [
        {
          ...siteConfig.og.size,
          alt: siteConfig.name,
          url: siteConfig.og.image,
        },
      ],
    },

    twitter: {
      creator: siteConfig.links.twitter.username,
      title: siteConfig.name,
      card: 'summary_large_image',
      images: [siteConfig.og.image],

      description: getObjectValueByLocale(siteConfig.description, locale),
    },

    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
      shortcut: '/favicon-16x16.png',
    },

    manifest: '/manifest.webmanifest',
  }
}

export const dynamicParams = true

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default async function RootLayout(props: {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}) {
  const params = await props.params

  const locale = (params.locale as LocaleOptions) || defaultLocale

  const { children } = props

  setRequestLocale(locale)

  const fontSans = await getSansFont()
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta content="#181423" name="theme-color" />
      </head>

      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          fontSans.variable
        )}
      >
        <NextIntlClientProvider
          locale={params.locale || defaultLocale}
          messages={{}}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
            enableSystem
          >
            <div>
              <div className="relative z-10 flex min-h-screen flex-col">
                <SiteHeader />

                <main className="flex-1">{children}</main>

                <SiteFooter />
              </div>

              <div className="fixed left-0 top-0 size-full bg-gradient-to-b from-[#a277ff] via-transparent to-transparent opacity-10" />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
