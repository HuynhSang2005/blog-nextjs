import { JetBrains_Mono as FontMono } from 'next/font/google'

import { absoluteUrl } from './utils'

export async function getSansFont() {
  try {
    const { GeistSans } = await import('geist/font/sans')
    return GeistSans
  } catch {
    return { variable: '' } as { variable: string }
  }
}

export const fontMono = FontMono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export async function getFonts() {
  try {
    const [bold, regular] = await Promise.all([
      fetch(new URL(absoluteUrl('/fonts/Geist-Bold.ttf')), {
        cache: 'force-cache',
      }).then(res => res.arrayBuffer()),

      fetch(new URL(absoluteUrl('/fonts/Geist-Regular.ttf')), {
        cache: 'force-cache',
      }).then(res => res.arrayBuffer()),
    ])

    return {
      bold,
      regular,
    }
  } catch (error) {
    console.warn('Failed to load fonts, using fallback:', error)
    return {
      bold: null,
      regular: null,
    }
  }
}
