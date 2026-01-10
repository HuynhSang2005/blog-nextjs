import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // React Compiler (stable in Next.js 16)
  // Full mode: automatic memoization for all components and hooks
  // Benefits: Reduces unnecessary re-renders, improves TBT by 20-40%
  // Trade-off: Slightly slower builds in development
  reactCompiler: true,

  experimental: {
    // Turbopack File System Caching (beta)
    // Stores compiler artifacts on disk between runs for faster restarts
    // Especially beneficial for large projects and monorepos
    turbopackFileSystemCacheForDev: true,

    optimizePackageImports: [
      // UI & Icons
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      // Animation
      'framer-motion',
      // Date & Time
      'date-fns',
      // State Management
      '@tanstack/react-query',
      '@tanstack/react-table',
      // Forms & Validation
      'react-hook-form',
      'zod',
      // UI Components
      'cmdk',
      'sonner',
      'vaul',
      // Radix UI (all components)
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-icons',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
    ],
  },
  turbopack: {},
}

const withNextIntl = createNextIntlPlugin()

// Bundle analyzer wrapper - only enabled when ANALYZE=true
const configWithBundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)

export default withNextIntl(configWithBundleAnalyzer)
