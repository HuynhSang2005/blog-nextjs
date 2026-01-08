---
applyTo: "apps/web/src/components/**/!(ui/**)"
---

# Component Development Instructions

## Component Guidelines

### Important Rules
- ✅ **All UI text MUST be in Vietnamese** (buttons, labels, placeholders)
- ⚠️ **Keep technical terms in English** (Next.js, React, props, etc.)
- ✅ Use `next-intl` translations from `i18n/locales/vi.json`
- ❌ No hardcoded English strings in user-facing UI
- ✅ Use Supabase for blog/docs/projects data (DB-first)

### Component Structure
```tsx
// 1. Imports
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl' // For client components
import { getTranslations } from 'next-intl/server' // For server components

// 2. Type definitions
interface ComponentProps {
  title: string
  children?: React.ReactNode
  className?: string
}

// 3. Client Component with Vietnamese UI
'use client'
export function Component({ title, children, className }: ComponentProps) {
  const t = useTranslations('blog')
  
  return (
    <div className={cn('base-classes', className)}>
      <h2>{title}</h2>
      <Button>{t('actions.readMore')}</Button> {/* "Đọc tiếp" not "Read more" */}
      {children}
    </div>
  )
}

// 4. Server Component with Vietnamese UI
export async function ServerComponent({ title }: ComponentProps) {
  const t = await getTranslations('blog')
  
  return (
    <div>
      <h2>{title}</h2>
      <p>{t('published')}</p> {/* "Xuất bản lúc" not "Published at" */}
    </div>
  )
}
```

### Naming Conventions
- **Component files**: kebab-case (e.g., `site-header.tsx`, `post-list.tsx`)
- **Component exports**: PascalCase (e.g., `SiteHeader`, `PostList`)
- **Props interface**: `ComponentNameProps`
- **Export**: Named export preferred (not default for reusable components)

### Component Categories

**apps/web/src/components/**
- Shared components used across the app
- Examples: `site-header.tsx`, `theme-toggle.tsx`, `command-menu.tsx`

**apps/web/src/components/blog/**
- Blog-specific components
- Examples: `post-item.tsx`, `pagination.tsx`, `post-tags.tsx`

**apps/web/src/components/docs/**
- Documentation-specific components
- Examples: `sidebar-nav.tsx`, `toc.tsx`, `pager.tsx`

**apps/web/src/components/ui/** (DO NOT EDIT)
- Shadcn UI components (regenerate via CLI if changes needed)
- Import and use, don't modify

### Props Pattern
```tsx
// Always destructure props
export function BlogPost({ title, excerpt, date, className }: BlogPostProps) {
  // ✅ Good
}

// Avoid props object
export function BlogPost(props: BlogPostProps) {
  // ❌ Bad
}
```

### Styling
```tsx
import { cn } from '@/lib/utils'

// Allow className override
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      // Base styles
      'rounded-lg border bg-card p-6',
      // Hover/focus states
      'hover:shadow-lg transition-shadow',
      // Dark mode
      'dark:border-gray-700',
      // User override
      className
    )}>
      {children}
    </div>
  )
}
```

### Server vs Client Components

**Default: Server Component**
```tsx
// No 'use client' needed
export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="card">
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </article>
  )
}
```

**Client Component (when needed):**
```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function SearchInput() {
  const t = useTranslations('search')
  const [query, setQuery] = useState('')
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={t('placeholder')} // "Tìm kiếm..." not "Search..."
      aria-label={t('label')} // "Tìm kiếm bài viết" not "Search posts"
    />
  )
}
```

**✅ Vietnamese UI Examples:**
```tsx
// Buttons
<Button>{t('actions.save')}</Button> // "Lưu"
<Button>{t('actions.delete')}</Button> // "Xóa"
<Button>{t('actions.publish')}</Button> // "Xuất bản"

// Form labels
<label>{t('form.title')}</label> // "Tiêu đề"
<label>{t('form.content')}</label> // "Nội dung"

// Status badges
<Badge>{t('status.draft')}</Badge> // "Bản nháp"
<Badge>{t('status.published')}</Badge> // "Đã xuất bản"
```

**Use Client Components for:**
- `useState`, `useEffect`, `useContext`
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Third-party client-only libraries

### Accessibility
- Add `aria-label` to icon-only buttons
- Use semantic HTML (`<article>`, `<nav>`, `<main>`)
- Ensure keyboard navigation works
- Test with screen reader if possible

### Performance
- Lazy load images with Next.js `<Image>`
- Use `loading="lazy"` for below-the-fold content
- Memoize expensive computations
- Avoid unnecessary re-renders

### Documentation
Add JSDoc comments for complex components:
```tsx
/**
 * Displays a blog post card with title, excerpt, and metadata.
 * 
 * @param post - Blog post data from Supabase
 * @param featured - Whether to highlight as featured post
 */
export function BlogCard({ post, featured }: BlogCardProps) {
  // ...
}
```

## Examples

### Simple Presentational Component
```tsx
import { formatDate } from '@/lib/utils'

interface PostMetaProps {
  date: Date
  readTime: number
  className?: string
}

export function PostMeta({ date, readTime, className }: PostMetaProps) {
  return (
    <div className={cn('flex items-center gap-4 text-sm text-muted-foreground', className)}>
      <time dateTime={date.toISOString()}>
        {formatDate(date)}
      </time>
      <span>{readTime} phút đọc</span>
    </div>
  )
}
```

### Client Interactive Component
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleCopy}
      aria-label={copied ? 'Đã sao chép' : 'Sao chép vào clipboard'}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}
```

### Composition Pattern
```tsx
// Parent component
export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="card">
      <BlogCardHeader post={post} />
      <BlogCardContent post={post} />
      <BlogCardFooter post={post} />
    </article>
  )
}

// Child components
function BlogCardHeader({ post }: { post: BlogPost }) {
  return (
    <header>
      <h2>{post.title}</h2>
      <PostMeta date={post.date} readTime={post.readTimeInMinutes} />
    </header>
  )
}

function BlogCardContent({ post }: { post: BlogPost }) {
  return <p>{post.excerpt}</p>
}

function BlogCardFooter({ post }: { post: BlogPost }) {
  return <PostTags tags={post.tags} />
}
```

## Common Patterns

### Conditional Rendering
```tsx
// ✅ Good - early return
if (!post) {
  return <div>Post not found</div>
}

return <BlogPost post={post} />

// ✅ Good - ternary for JSX
{isLoading ? <Skeleton /> : <Content />}

// ✅ Good - && for optional rendering
{showAuthor && <AuthorCard author={post.author} />}
```

### List Rendering
```tsx
// Always use stable keys
{posts.map((post) => (
  <BlogCard key={post._id} post={post} />
))}

// Add empty state
{posts.length === 0 && (
  <div className="text-center py-10">
    <p className="text-muted-foreground">No posts found</p>
  </div>
)}
```

### Error Boundaries
Wrap components that might error:
```tsx
import { ErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

## Testing (Future)
When adding tests:
- Place in `__tests__` directory or co-located `.test.tsx`
- Test user interactions, not implementation details
- Use Testing Library queries (`getByRole`, `getByText`)
