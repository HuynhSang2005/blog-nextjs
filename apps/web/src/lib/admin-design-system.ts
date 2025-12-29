/**
 * Admin Design System
 * Consistent spacing, sizing, and styling tokens for admin dashboard
 * Based on 2025 best practices: 8px grid system, WCAG AA contrast, responsive breakpoints
 */

export const adminDesignSystem = {
  /**
   * Spacing tokens (8px base grid)
   */
  spacing: {
    // Page-level spacing
    page: {
      padding: 'p-6 lg:p-8', // 24px mobile, 32px desktop
      gap: 'gap-6', // 24px between sections
      maxWidth: 'mx-auto max-w-7xl', // Container max-width
    },

    // Card spacing
    card: {
      padding: 'p-4 sm:p-6', // 16px mobile, 24px tablet+
      gap: 'gap-4', // 16px between card sections
      borderRadius: 'rounded-lg', // 8px
    },

    // Grid gaps
    grid: {
      tight: 'gap-2', // 8px
      normal: 'gap-4', // 16px
      loose: 'gap-6', // 24px
      extraLoose: 'gap-8', // 32px
    },

    // Form elements
    form: {
      fieldGap: 'gap-4', // 16px between form fields
      labelMargin: 'mb-2', // 8px below labels
      inputPadding: 'px-3 py-2', // 12px x 8px
    },
  },

  /**
   * Layout dimensions
   */
  layout: {
    // Sidebar
    sidebar: {
      width: 'w-64', // 256px expanded
      collapsedWidth: 'w-16', // 64px collapsed
    },

    // Header
    header: {
      height: 'h-16', // 64px
      sticky: 'sticky top-0 z-10',
    },

    // Content area
    content: {
      minHeight: 'min-h-[calc(100vh-4rem)]', // Full height minus header
      maxWidth: 'max-w-7xl', // 1280px
    },

    // Cards
    card: {
      minHeight: 'min-h-[120px]', // Stats cards
      statCard: 'min-h-[140px]', // Dashboard stat cards
    },
  },

  /**
   * Typography scale
   */
  typography: {
    // Headings
    h1: 'text-3xl font-bold tracking-tight lg:text-4xl',
    h2: 'text-2xl font-semibold tracking-tight',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-semibold',

    // Body
    body: 'text-base',
    small: 'text-sm',
    xs: 'text-xs',

    // Muted text
    muted: 'text-muted-foreground',
  },

  /**
   * Component sizes
   */
  components: {
    // Buttons
    button: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
      icon: 'h-10 w-10',
    },

    // Input fields
    input: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-3',
      lg: 'h-12 px-4',
    },

    // Avatars
    avatar: {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },

    // Badges
    badge: {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-0.5',
      lg: 'text-sm px-3 py-1',
    },
  },

  /**
   * Animation tokens
   */
  animation: {
    // Transitions
    transition: 'transition-all duration-200',
    transitionSlow: 'transition-all duration-300',
    transitionFast: 'transition-all duration-150',

    // Hover effects
    hover: {
      card: 'hover:shadow-lg hover:border-primary/50 transition-all duration-200',
      button: 'hover:opacity-90 transition-opacity duration-150',
      link: 'hover:underline',
    },

    // Focus states
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  },

  /**
   * Color system
   */
  colors: {
    // Status colors
    status: {
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-blue-600 dark:text-blue-400',
    },

    // Background variants
    background: {
      subtle: 'bg-muted/50',
      card: 'bg-card',
      elevated: 'bg-card shadow-sm',
    },

    // Border colors
    border: {
      default: 'border-border',
      muted: 'border-muted',
      primary: 'border-primary',
    },
  },

  /**
   * Grid systems
   */
  grid: {
    // Responsive columns
    cards: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    stats: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    twoColumn: 'grid grid-cols-1 lg:grid-cols-2',

    // Dashboard specific
    dashboard: {
      stats: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
      main: 'grid grid-cols-1 gap-6 lg:grid-cols-3',
    },
  },

  /**
   * Shadows
   */
  shadow: {
    card: 'shadow-sm hover:shadow-md',
    elevated: 'shadow-md',
    dialog: 'shadow-lg',
  },

  /**
   * Responsive breakpoints (Tailwind defaults)
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

/**
 * Helper function to combine admin design tokens
 */
export function adminClass(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Pre-composed class combinations for common patterns
 */
export const adminPatterns = {
  // Page containers
  page: adminClass(
    adminDesignSystem.spacing.page.padding,
    adminDesignSystem.spacing.page.maxWidth,
    adminDesignSystem.spacing.page.gap,
    'flex flex-col'
  ),

  // Stat cards (dashboard)
  statCard: adminClass(
    adminDesignSystem.spacing.card.padding,
    adminDesignSystem.spacing.card.borderRadius,
    adminDesignSystem.layout.card.statCard,
    'bg-card border',
    adminDesignSystem.animation.transition
  ),

  // Form container
  form: adminClass(
    adminDesignSystem.spacing.form.fieldGap,
    'flex flex-col w-full'
  ),

  // Data table container
  table: adminClass(
    'rounded-md border',
    'bg-card'
  ),

  // Section heading
  sectionHeading: adminClass(
    adminDesignSystem.typography.h2,
    'mb-4'
  ),
} as const

/**
 * Type exports for TypeScript autocomplete
 */
export type AdminSpacing = typeof adminDesignSystem.spacing
export type AdminLayout = typeof adminDesignSystem.layout
export type AdminTypography = typeof adminDesignSystem.typography
export type AdminComponents = typeof adminDesignSystem.components
export type AdminAnimation = typeof adminDesignSystem.animation
export type AdminColors = typeof adminDesignSystem.colors
export type AdminGrid = typeof adminDesignSystem.grid
