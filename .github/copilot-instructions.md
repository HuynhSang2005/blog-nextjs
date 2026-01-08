# GitHub Copilot Instructions

> Custom instructions for GitHub Copilot when working on Huỳnh Sang Blog

**Project**: Next.js 16 Blog-Portfolio Monorepo  
**Tech Stack**: Next.js 16, React 19, TypeScript, Turborepo, Supabase, Cloudinary, Shadcn UI  
**Primary Language**: Vietnamese (vi)

---

## 🎯 Project Context

This is a **monorepo blog-portfolio platform** built with Next.js 16 App Router.

**Source of truth (DB-first):**
- **Blog posts**: Supabase database
- **Docs**: Supabase database (lưu nội dung dạng MDX string, render runtime)
- **Projects**: Supabase database
- **Media**: Cloudinary (file) + Supabase `media` (metadata/reference)

The project uses Bun as package manager and Biome for linting/formatting (not ESLint/Prettier).

**Key architectural principles:**
- Server Components by default (only use `'use client'` when necessary)
- Supabase-first data access for dynamic content
- Shadcn UI components (copy-paste, not npm packages)
- Vietnamese-first UI with i18n support via next-intl
- Strict TypeScript with no `any` types

**MCP / tools workflow (bắt buộc):**
- Repo ops (tìm file/đọc/sửa): ưu tiên Serena tools
- DB schema/migrations: Supabase MCP `apply_migration`
- DB queries/debug data: Supabase MCP `execute_sql`
- Tra docs thư viện: Context7
- Tra cứu web/so sánh: Perplexity

**I18n & Content Rules:**
- ✅ **All UI text MUST be in Vietnamese** (buttons, labels, messages)
- ⚠️ **Keep technical terms in English** (Next.js, React, API, etc.)
- ✅ Use translations from `i18n/locales/vi.json`
- ❌ No hardcoded English strings in UI components

---

## 📐 Code Style & Conventions

### TypeScript
- Always use TypeScript (strict mode enabled, no `any`)
- Prefer `interface` over `type` for object shapes
- Export types used across multiple files
- Use `unknown` instead of `any` when type is truly unknown

```typescript
// ✅ Preferred
interface BlogPostProps {
  title: string
  date: Date
  slug: string
}

// ❌ Avoid
type BlogPostProps = {
  title: any  // Don't use any
  date: any
  slug: any
}
```

### React Components

**Server Components (default):**
```tsx
// No 'use client' directive needed
export default async function BlogPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params  // Next.js 16 - await params
  const posts = await fetchPosts(locale)
  return <div>{posts.map(...)}</div>
}
```

**Client Components (only when needed):**
```tsx
'use client'

import { useState } from 'react'

export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**When to use Client Components:**
- useState, useEffect, useContext hooks
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Third-party libraries requiring client-side

### File Naming
- Components: **kebab-case** (`blog-pagination.tsx`, `site-header.tsx`)
- Utilities: **camelCase** (`formatDate.ts`, `cn.ts`)
- Config: **kebab-case** (`site.ts`, `blog.ts`)
- MDX content: **kebab-case** (`gioi-thieu-blog.mdx`)

### Imports
```tsx
// Use path aliases (configured in tsconfig.json)
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'

// Prefer project-local types (DB-backed)
```

### Tailwind CSS
- Use Tailwind utility classes for all styling
- Use `cn()` utility from `@/lib/utils` to merge classes
- Dark mode: use `dark:` prefix
- Responsive: use `sm:`, `md:`, `lg:`, `xl:` prefixes

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg border bg-card p-6',
  'hover:shadow-lg transition-shadow',
  'dark:border-gray-700',
  isActive && 'border-primary'
)} />
```

---

## 🏗 Architecture Patterns

### App Router Structure
```
apps/web/src/app/[locale]/
├── layout.tsx          # Root layout with i18n provider
├── page.tsx            # Homepage
├── blog/
│   ├── page.tsx       # Blog listing (Server Component)
│   └── [slug]/
│       └── page.tsx   # Post detail (Static Generation)
└── docs/
    └── [...slug]/
        └── page.tsx   # Docs pages (Static Generation)
```

### Data Fetching

**Blog Posts (from Database):**
```tsx
import { getBlogPosts } from '@/services/blog-service'

// Server Component - fetch từ Supabase (DB-first)
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { data: posts } = await getBlogPosts(locale, 'published', {
    page: 1,
    pageSize: 10,
  })

  return <div>{posts.map(post => <PostCard key={post.id} post={post} />)}</div>
}
```

**Documentation (from MDX):**
```tsx
import { getPublicDocBySlug } from '@/services/docs-service'
import { MdxRemote } from '@/components/docs/mdx-remote'

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string; slug?: string[] }>
}) {
  const { locale, slug } = await params
  const doc = await getPublicDocBySlug({ locale, slugParts: slug })
  return <MdxRemote source={doc.content} />
}
```

### Component Composition
```tsx
// Prefer composition over prop drilling
export function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto">
      <BlogHeader />
      <main>{children}</main>
      <BlogFooter />
    </div>
  )
}
```

### Shadcn UI Usage
```tsx
// Import from @/components/ui/*
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Use with variants (defined by Shadcn)
<Button variant="default" size="lg">Nút chính</Button>
<Button variant="outline" size="sm">Nút phụ</Button>
<Button variant="ghost">Nút ẩn</Button>
```

---

## 🔒 Critical Rules

### DO NOT MODIFY
- `apps/web/src/lib/core/**` - Core utilities (immutable)
- `apps/web/contentlayer.config.ts` - Contentlayer config
- `packages/**` - Shared packages
- `turbo.json` - Turborepo pipeline
- `.husky/**` - Git hooks

### ALWAYS DO
- Run `bun run biome check --write .` before committing
- Use TypeScript strict mode (no `any` types)
- Await `params` and `searchParams` in Next.js 16 pages
- Use Supabase queries for blog posts (not MDX)
- Use Supabase queries for docs/projects (DB-first)
- Store media references in database, files in Cloudinary
- **Write ALL UI text in Vietnamese** (use `vi.json` translations)
- Add JSDoc comments for complex functions

### NEVER DO
- Don't install ESLint or Prettier (use Biome)
- Don't use CSS modules or styled-components (use Tailwind)
- Don't add `'use client'` unless absolutely necessary
- Don't modify Shadcn UI components in `components/ui/` (regenerate via CLI instead)
- Don't commit `.env*.local` files
- **Don't hardcode English text in UI components**
- Don't query MDX files for blog posts (use Supabase instead)

---

## 🌐 Internationalization

Current locale: **Vietnamese (vi)**  
Translation file: `apps/web/src/i18n/locales/vi.json`

**Rules:**
- ✅ ALL UI text in Vietnamese (buttons, labels, messages, navigation)
- ⚠️ Keep technical terms in English (Next.js, React, API, Server Components)
- ✅ Form validation messages in Vietnamese
- ✅ Error/success toasts in Vietnamese

```tsx
// Server Component
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('blog')
  return (
    <div>
      <h1>{t('title')}</h1>
      <Button>{t('actions.create')}</Button> {/* "Tạo mới" not "Create" */}
    </div>
  )
}

// Client Component
'use client'
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations('admin')
  return (
    <button onClick={handleSave}>
      {t('actions.save')} {/* "Lưu" not "Save" */}
    </button>
  )
}
```

**Translation File Structure (`vi.json`):**
```json
{
  "site": { "description": "...", "words": { "blog": "Blog", "docs": "Tài liệu" } },
  "blog": { "title": "Blog", "readMore": "Đọc tiếp", "published": "Xuất bản lúc" },
  "admin": { 
    "actions": { "save": "Lưu", "delete": "Xóa", "publish": "Xuất bản" },
    "status": { "draft": "Bản nháp", "published": "Đã xuất bản" }
  },
  "validation": {
    "required": "Trường này là bắt buộc",
    "minLength": "Tối thiểu {min} ký tự"
  }
}
```

---

## 📦 Dependencies

### Package Manager
Always use **Bun** (not npm, yarn, or pnpm):
```bash
bun add package-name
bun add -D dev-package
bun install
```

### Adding Shadcn Components
```bash
cd apps/web
bunx shadcn@latest add button
bunx shadcn@latest add card
```

### Preferred Libraries
- **UI**: Shadcn UI (via CLI, not npm)
- **Icons**: Lucide React
- **Dates**: date-fns
- **Forms**: React Hook Form (if needed)
- **Validation**: Zod (if needed)

---

## 🧪 Commands Reference

### Development
```bash
# Start dev server (from root or apps/web)
bun dev

# Type check
bun run tsc --noEmit

# Lint & format
bun run biome check --write .

# (Legacy) Build Contentlayer types only if you are explicitly working on legacy MDX pipelines
# bun run contentlayer:build
```

### Build
```bash
# Full build (from root)
turbo build

# Or from apps/web
cd apps/web && bun run build
```

---

## 📚 Documentation Notes

- `docs/` có thể thay đổi/xoá/di chuyển. Khi cần, ưu tiên search trong workspace và đọc file liên quan trực tiếp đến feature đang sửa.

---

## 💡 Copilot Tips

1. **Check existing patterns** before generating new code
2. **Ưu tiên Supabase** cho dữ liệu dynamic (blog/docs/projects)
3. **Prefer Server Components** unless interactivity is required
4. **Follow file naming conventions** strictly
5. **Use Tailwind CSS** for all styling
6. **Import from path aliases** (@/components, @/lib, @/config)
7. **Read AGENTS.md** for comprehensive context

---

**Last Updated**: January 3, 2026  
**Maintained by**: Huỳnh Sang
