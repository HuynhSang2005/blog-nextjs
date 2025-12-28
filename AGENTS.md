# Huỳnh Sang Blog - AI Agent Instructions

> Instructions for AI coding agents working on this Next.js 16 blog monorepo

**Project**: Huỳnh Sang Blog  
**Tech Stack**: Next.js 16 + React 19 + TypeScript + Contentlayer + Turborepo + Supabase + Cloudinary  
**Primary Language**: Vietnamese (vi)  
**Last Updated**: December 27, 2025

---

## 📋 Project Overview

Personal blog-portfolio platform built with Next.js 16 App Router in a Turborepo monorepo. Features database-backed blog posts, MDX documentation, admin dashboard, portfolio sections, internationalization, dark mode, and SEO optimization.

**Key Characteristics:**
- Monorepo with `apps/content` (MDX docs) and `apps/web` (Next.js app)
- **Hybrid Content Strategy**:
  - Blog posts: Database (Supabase) with admin CRUD
  - Documentation: MDX files (Git-based, Contentlayer2)
- **Media Storage**: Cloudinary CDN (not database)
- Type-safe content via Contentlayer2 and Supabase generated types
- Shadcn UI component system (copy-paste components, not npm package)
- Biome for linting/formatting (replaces ESLint + Prettier)
- Bun as package manager (not npm/yarn/pnpm)

**I18n & Content Rules:**
- ✅ **All UI text must be in Vietnamese** (`vi.json` translations)
- ⚠️ **Keep technical terms in English** (Next.js, React, API, etc.)
- ✅ **Buttons, labels, messages**: Tiếng Việt
- ⚠️ **Code, endpoints, variables**: English

---

## 🏗 Architecture

### Monorepo Structure
```
blog-nextjs/
├── apps/
│   ├── content/              # MDX content files
│   │   ├── blog/vi/         # Vietnamese blog posts
│   │   └── docs/vi/         # Vietnamese documentation
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/[locale]/ # App Router with i18n
│       │   ├── components/   # React components
│       │   ├── config/       # Site, blog, docs config
│       │   ├── lib/core/     # Core utilities (DO NOT MODIFY)
│       │   └── styles/       # Global CSS + themes
│       ├── contentlayer.config.ts
│       └── package.json
├── packages/
│   ├── biome-config/        # Shared Biome config
│   └── typescript-config/   # Shared TS config
└── docs/                    # Project documentation
    ├── dev-v1/              # Development guides
    │   ├── PHASE-1-FOUNDATION.md (Database + Auth)
    │   ├── PHASE-2-ADMIN-DASHBOARD.md (Admin UI)
    │   ├── PHASE-3-PORTFOLIO.md (About + Projects)
    │   ├── database-schema-cloudinary.md (Schema)
    │   ├── environment-variables.md (Env setup)
    │   ├── I18N-CONTENT-GUIDELINES.md (Vietnamese UI)
    │   ├── MDX-CONTENT-STRATEGY.md (Hybrid approach)
    │   └── ui-ux-design/ (UI/UX layouts)
    ├── README.md
    ├── architecture.md
    └── development.md
```

### Next.js 16 App Router Structure
```
apps/web/src/app/[locale]/
├── layout.tsx               # Root layout with i18n
├── page.tsx                 # Homepage
├── blog/
│   ├── page.tsx            # Blog listing
│   ├── [slug]/
│   │   └── page.tsx        # Blog post detail
│   └── tags/[tag]/
│       └── page.tsx        # Tag-filtered posts
├── docs/
│   └── [...slug]/
│       └── page.tsx        # Docs pages
├── feed/
│   └── [format]/
│       └── route.ts        # RSS/JSON feeds
├── manifest.ts             # PWA manifest
├── robots.txt              # SEO robots
└── sitemap.ts              # Dynamic sitemap
```

---

## 🔨 Build & Development

### Type check a single file
```bash
cd apps/web
bun run tsc --noEmit src/path/to/file.tsx
```

### Format a single file
```bash
cd apps/web
bun run biome format --write src/path/to/file.tsx
```

### Lint a single file
```bash
cd apps/web
bun run biome lint --fix src/path/to/file.tsx
```

### Check all (lint + format + typecheck)
```bash
cd apps/web
bun run biome check --write .
```

### Development server (Turbopack)
```bash
# From root or apps/web
bun dev
```

### Full build (use sparingly)
```bash
# From root
turbo build

# Or from apps/web
bun run build
```

### Test Contentlayer generation
```bash
cd apps/web
bun run contentlayer:build
```

---

## �️ Database & Backend

### Supabase PostgreSQL Database

**Primary Tables:**
- **`blog_posts`**: Title, slug, content (MDX), excerpt, status, locale, published_at, author_id, cover_media_id
- **`projects`**: Title, slug, description (MDX), status, locale, start_date, end_date, cover_media_id, og_media_id
- **`media`**: Cloudinary metadata (public_id, version, resource_type, format, width, height, alt_text)
- **`profiles`**: User profiles (id, email, full_name, role, avatar_media_id)
- **`project_media`**: Junction table for project galleries (many-to-many)

**Authentication:**
- Supabase Auth with Row Level Security (RLS)
- Admin role check in middleware
- No public user registration (admin-only system)

**Database Queries:**
```typescript
// apps/web/src/lib/supabase/queries.ts
import { createClient } from '@/lib/supabase/server'

export async function getBlogPosts(locale: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, media(*), profiles(*)')
    .eq('locale', locale)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getProjects(locale: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, media!cover_media_id(*)')
    .eq('locale', locale)
    .eq('status', 'published')
    .order('start_date', { ascending: false })
  
  if (error) throw error
  return data
}
```

**See:** [database-schema-cloudinary.md](docs/dev-v1/database-schema-cloudinary.md) for full schema

---

## 📸 Cloudinary Media Storage

**Architecture:**
- **Cloudinary CDN**: Stores actual image/video files (not in database)
- **Supabase `media` table**: Stores only metadata (public_id, dimensions, alt_text)
- **Upload Widget**: Client-side unsigned upload to Cloudinary preset

**Media Table Structure:**
```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_public_id TEXT NOT NULL UNIQUE,
  cloudinary_version INTEGER,
  resource_type TEXT NOT NULL DEFAULT 'image', -- image | video | raw
  format TEXT, -- jpg, png, mp4, etc.
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Upload Pattern:**
```typescript
// Client Component with Cloudinary Widget
'use client'

import { CldUploadWidget } from 'next-cloudinary'
import { createClient } from '@/lib/supabase/client'

export function ImageUploader({ onUpload }) {
  const supabase = createClient()
  
  async function handleSuccess(result: any) {
    // Save metadata to Supabase
    const { data, error } = await supabase
      .from('media')
      .insert({
        cloudinary_public_id: result.info.public_id,
        cloudinary_version: result.info.version,
        resource_type: result.info.resource_type,
        format: result.info.format,
        width: result.info.width,
        height: result.info.height,
        bytes: result.info.bytes,
      })
      .select()
      .single()
    
    if (error) throw error
    onUpload(data)
  }
  
  return (
    <CldUploadWidget
      uploadPreset="blog-uploads"
      onSuccess={handleSuccess}
    >
      {({ open }) => <button onClick={() => open()}>Upload Image</button>}
    </CldUploadWidget>
  )
}
```

**Display Pattern:**
```typescript
import { CldImage } from 'next-cloudinary'

export function BlogCoverImage({ media }) {
  return (
    <CldImage
      src={media.cloudinary_public_id}
      width={media.width}
      height={media.height}
      alt={media.alt_text || ''}
      crop="fill"
      gravity="auto"
    />
  )
}
```

**See:** [environment-variables.md](docs/dev-v1/environment-variables.md) for setup

---

## �📐 Conventions & Patterns

### File Naming
- **Components**: PascalCase (`BlogPost.tsx`, `SiteHeader.tsx`)
- **Utilities**: camelCase (`formatDate.ts`, `getBlogPosts.ts`)
- **Config files**: kebab-case (`site.ts`, `blog.ts`, `code-theme.ts`)
- **Types**: PascalCase (`BlogPost`, `DocPage`, `NavItem`)
- **MDX content**: kebab-case (`gioi-thieu-blog.mdx`, `huong-dan-tao-blog-nextjs.mdx`)

### Folder Structure
```
src/
├── app/[locale]/           # App Router pages
├── components/
│   ├── ui/                 # Shadcn UI components (DO NOT EDIT - regenerate via CLI)
│   ├── blog/               # Blog-specific components
│   ├── docs/               # Docs-specific components
│   └── *.tsx               # Shared components
├── config/
│   ├── site.ts             # Site metadata, links, author
│   ├── blog.ts             # Blog config (posts per page, etc.)
│   ├── docs.ts             # Docs navigation structure
│   ├── i18n.ts             # i18n locales config
│   └── code-theme.ts       # Syntax highlighting theme
├── lib/
│   ├── core/               # Core utilities (IMMUTABLE - DO NOT MODIFY)
│   │   ├── types/          # Core TypeScript types
│   │   └── utils/          # Core utility functions
│   ├── fonts.ts            # Font definitions
│   └── utils.ts            # App-specific utilities
├── i18n/
│   ├── request.ts          # i18n middleware
│   └── locales/
│       └── vi.json         # Vietnamese translations
└── styles/
    ├── globals.css         # Global styles + CSS variables
    ├── mdx.css             # MDX content styles
    └── themes/             # Syntax highlight themes
```

### Component Patterns

#### Server Components (Default)
```tsx
// apps/web/src/app/[locale]/blog/page.tsx
import { allBlogPosts } from 'contentlayer/generated'

export default async function BlogPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params
  const posts = allBlogPosts.filter(p => p.locale === locale)
  
  return <div>...</div>
}
```

#### Client Components (when needed)
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <Button onClick={() => setCount(count + 1)}>{count}</Button>
}
```

#### Shadcn UI Usage
```tsx
// Import from @/components/ui/*
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Use with variants
<Button variant="default" size="lg">Click me</Button>
<Button variant="outline">Secondary</Button>
```

### Code Style

#### TypeScript
- **Always use TypeScript**, never JavaScript
- **Strict mode enabled** - no `any` types (use `unknown` if needed)
- **Prefer interfaces** over types for object shapes
- **Export types** that are used in multiple files

```tsx
// ✅ Good
interface BlogPostProps {
  title: string
  excerpt: string
  date: Date
}

export function BlogPost({ title, excerpt, date }: BlogPostProps) {
  return <article>...</article>
}

// ❌ Bad - no types
export function BlogPost({ title, excerpt, date }: any) {
  return <article>...</article>
}
```

#### React
- **Prefer functional components** with hooks
- **Use Server Components by default**, only add `'use client'` when necessary
- **Async Server Components** for data fetching (no useState/useEffect for data)
- **Destructure props** in function signature

```tsx
// ✅ Good - Server Component with async
export default async function Page({ params }: PageProps) {
  const { locale } = await params
  const data = await fetchData(locale)
  return <div>{data}</div>
}

// ✅ Good - Client Component when needed
'use client'
export function InteractiveButton() {
  const [isOpen, setIsOpen] = useState(false)
  return <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
}

// ❌ Bad - unnecessary client component
'use client'
export function StaticContent() {
  return <div>Static content</div>
}
```

#### Styling
- **Tailwind CSS classes** for all styling (no CSS modules, no styled-components)
- **Use `cn()` utility** from `@/lib/utils` to merge classes
- **Dark mode**: Use `dark:` prefix (managed by next-themes)

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'rounded-lg border bg-card p-6',
  'hover:shadow-lg transition-shadow',
  'dark:border-gray-700',
  isActive && 'border-primary'
)}>
  Content
</div>
```

### Internationalization (i18n)

**Current locale**: Vietnamese (vi)  
**Translation files**: `apps/web/src/i18n/locales/vi.json`

```tsx
// Server Component
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('blog')
  return <h1>{t('title')}</h1>
}

// Client Component
'use client'
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations('blog')
  return <h1>{t('title')}</h1>
}
```

### MDX Content

**Blog posts** in `apps/content/blog/vi/*.mdx`:
```markdown
---
title: Blog Post Title
excerpt: Short description
date: 2025-12-27
author_id: huynhsang
tags:
  - nextjs
  - typescript
featured: true
---

# Heading

Content here...
```

**Docs** in `apps/content/docs/vi/*.mdx`:
```markdown
---
title: Documentation Page
description: Page description
---

# Heading

Content here...
```

---

## 🧪 Testing

### Current State
- **No automated tests yet** (planned for future)
- Manual testing via `bun dev` and build verification

### When adding tests (future):
- Use **Vitest** for unit tests
- Use **Playwright** for E2E tests
- Place tests in `__tests__` directories or `.test.tsx` files
- Test critical utilities and complex components

---

## 🔐 Security & Boundaries

### DO NOT MODIFY
- `apps/web/src/lib/core/**` - Core utilities (immutable)
- `apps/web/contentlayer.config.ts` - Contentlayer configuration
- `packages/*/` - Shared packages (modify only if absolutely necessary)
- `.husky/` - Git hooks
- `turbo.json` - Turborepo pipeline

### DO NOT COMMIT
- `.env*.local` files (environment variables)
- `node_modules/`
- `.next/` build output
- `.contentlayer/` generated files
- `.turbo/` cache

### ALWAYS
- Run `bun run biome check --write .` before committing
- Use conventional commit format
- Update `package.json` when adding dependencies
- Test locally with `bun dev` before pushing

---

## 🚀 Git Workflow

### Conventional Commits
```bash
# Format: <type>[optional scope]: <description>

feat(blog): add pagination component
fix(docs): correct broken navigation links
docs: update architecture documentation
style: format code with Biome
refactor(components): extract reusable card component
perf: optimize image loading
chore: upgrade Next.js to 16.1.1
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### Branching
- `main` - Production branch (protected)
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Process
```bash
# Stage changes
git add .

# Commitlint will check format automatically
git commit -m "feat(blog): add dark mode toggle"

# Push
git push origin feature/dark-mode
```

---

## 📦 Dependencies

### Adding New Dependencies
```bash
cd apps/web
bun add package-name

# Dev dependency
bun add -D package-name

# Workspace dependency
bun add @huynhsang-blog/package-name --workspace
```

### Preferred Libraries
- **UI Components**: Shadcn UI (copy via CLI, don't install as package)
- **Icons**: Lucide React (already installed)
- **Dates**: date-fns (already installed)
- **Class merging**: clsx + tailwind-merge via `cn()` utility
- **Forms**: React Hook Form (not yet installed, use if needed)
- **Validation**: Zod (not yet installed, use if needed)

### DO NOT INSTALL
- ESLint (using Biome instead)
- Prettier (using Biome instead)
- CSS-in-JS libraries (using Tailwind)
- Alternative UI libraries (using Shadcn UI)

---

## 📚 Documentation References

- **Setup**: [docs/setup.md](docs/setup.md)
- **Architecture**: [docs/architecture.md](docs/architecture.md)
- **Development**: [docs/development.md](docs/development.md)
- **Deployment**: [docs/deployment.md](docs/deployment.md)
- **Contentlayer**: [docs/contentlayer.md](docs/contentlayer.md)
- **App Router**: [docs/app-router.md](docs/app-router.md)
- **Turborepo**: [docs/turborepo.md](docs/turborepo.md)
- **Contributing**: [docs/contributing.md](docs/contributing.md)

### Development Phases (dev-v1/)
- **Phase 1**: [docs/dev-v1/PHASE-1-FOUNDATION.md](docs/dev-v1/PHASE-1-FOUNDATION.md) - Database & Auth setup (Supabase)
- **Phase 2**: [docs/dev-v1/PHASE-2-ADMIN-DASHBOARD.md](docs/dev-v1/PHASE-2-ADMIN-DASHBOARD.md) - Admin dashboard with Shadcn UI
- **Phase 3**: [docs/dev-v1/PHASE-3-PORTFOLIO.md](docs/dev-v1/PHASE-3-PORTFOLIO.md) - Portfolio and about pages
- **Phase 4-6**: [docs/dev-v1/PHASE-4-5-6-COMBINED.md](docs/dev-v1/PHASE-4-5-6-COMBINED.md) - Blog enhancements, docs multi-topic, polish

### Analysis Documents
- **Project Analysis**: [docs/dev-v1/PROJECT-ANALYSIS.md](docs/dev-v1/PROJECT-ANALYSIS.md)
- **Tech Stack**: [docs/dev-v1/TECH-STACK-RECOMMENDATIONS.md](docs/dev-v1/TECH-STACK-RECOMMENDATIONS.md)
- **Implementation Plan**: [docs/dev-v1/IMPLEMENTATION-PLAN.md](docs/dev-v1/IMPLEMENTATION-PLAN.md)
- **Admin Template Analysis**: [docs/dev-v1/ADMIN-TEMPLATE-ANALYSIS.md](docs/dev-v1/ADMIN-TEMPLATE-ANALYSIS.md)

---

## ⚠️ Important Notes

### Contentlayer Integration
- Documentation content is **statically generated** from MDX at build time
- Blog posts are **dynamically fetched** from Supabase database (not MDX)
- Contentlayer runs during build to generate TypeScript types from MDX docs
- If you modify `contentlayer.config.ts`, run `bun run contentlayer:build`
- Generated types are in `contentlayer/generated` (gitignored)

**Hybrid Content Strategy:**
- ✅ **Blog posts**: Supabase database with admin CRUD interface
- ✅ **Documentation**: MDX files (Git-based, Contentlayer2 processing)
- ✅ **Media**: Cloudinary CDN (metadata in database, files in cloud)

### Next.js 16 App Router
- All routes are in `apps/web/src/app/[locale]/`
- **Server Components by default** - no `'use client'` unless needed
- Use `await params` and `await searchParams` (Next.js 16 change)
- Metadata is exported from page/layout files

### Turborepo
- Commands run from root affect all apps/packages
- `turbo dev` starts all dev servers
- `turbo build` builds all packages in dependency order
- Individual package commands: `cd apps/web && bun dev`

### Biome (Not ESLint/Prettier)
- Single tool for linting + formatting
- Config in `biome.json` and `packages/biome-config/`
- Run `bun run biome check --write .` to fix all issues
- Integrates with VS Code via Biome extension

---

## 🎯 Current Development Focus

**Immediate priorities** (as of December 27, 2025):
1. ✅ Project setup and documentation complete
2. 🔄 Phase 1: Database setup with Supabase (in planning)
3. 🔜 Phase 2: Admin dashboard implementation
4. 🔜 Phase 3-6: Portfolio, blog enhancements, polish

**Not yet implemented** (future work):
- Authentication system (Supabase Auth planned)
- Admin dashboard (design documented)
- Database integration (schema designed)
- Portfolio pages
- Advanced blog features (search, series)
- Multi-topic documentation
- Automated tests

When implementing new features, **always follow the phase guides** in `docs/dev-v1/`.

---

## 💡 Tips for AI Agents

1. **Read the docs first**: Check relevant docs before making changes
2. **Follow existing patterns**: Match the coding style of nearby files
3. **Be conservative**: Don't add dependencies or make architectural changes without asking
4. **Test locally**: Always verify changes work with `bun dev`
5. **Check types**: Run `bun run tsc --noEmit` to catch type errors
6. **Use Contentlayer types**: Import from `contentlayer/generated` for docs only (not blog posts)
7. **Use Supabase queries**: For blog posts, use database queries (not MDX files)
8. **Respect boundaries**: Don't modify files in `lib/core/` or package configs
9. **Vietnamese UI first**: Write all UI text in Vietnamese, use `vi.json` translations
10. **Ask before**: Clarify requirements for complex features or architectural decisions

---

**Last Updated**: December 27, 2025  
**Maintained by**: Huỳnh Sang  
**For questions**: Check docs/ or ask the project maintainer
