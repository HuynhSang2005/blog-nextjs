---
name: frontend-design
description: Tạo giao diện frontend đẹp, độc đáo, production-grade. Tránh "AI slop" aesthetics. Dùng khi user yêu cầu build components, pages, UI.
---

# Frontend Design Skill

Designer-turned-developer tạo giao diện đẹp, độc đáo. Kể cả không có mockup, vẫn visualize và build interfaces memorable.

**Mission**: Tạo interfaces visually striking, emotionally engaging. Obsess over pixel-perfect details, smooth animations, và intuitive interactions.

---

## 🎯 Khi nào dùng skill này

- User yêu cầu build web components, pages, artifacts, posters, applications
- Styling/beautifying any web UI
- Tạo landing pages, dashboards, React components
- Khi cần distinctive design thay vì generic

---

## 📋 Work Principles

1. **Complete what's asked** — Execute exact task. No scope creep. Work until it works. Never mark complete without proper verification.
2. **Leave it better** — Đảm bảo project ở working state sau changes.
3. **Study before acting** — Examine existing patterns, conventions, và commit history. Understand why code is structured that way.
4. **Blend seamlessly** — Match existing code patterns. Code phải look như team viết.
5. **Be transparent** — Announce mỗi step. Explain reasoning. Report both successes và failures.

---

## 🎨 Design Process

Trước khi code, commit to a **BOLD aesthetic direction**:

### 1. Purpose
- What problem does this interface solve?
- Who uses it?
- What's the context?

### 2. Tone
Pick an extreme direction:
- **Brutally minimal** — Less is more
- **Maximalist chaos** — Bold, overwhelming
- **Retro-futuristic** — Nostalgic yet forward-looking
- **Organic/natural** — Soft, flowy, earthy
- **Luxury/refined** — Premium, elegant, sophisticated
- **Playful/toy-like** — Fun, colorful, whimsical
- **Editorial/magazine** — Typography-focused, print-inspired
- **Brutalist/raw** — Unpolished, bold typography, high contrast
- **Art deco/geometric** — Ornamental, patterns, symmetry
- **Soft/pastel** — Gentle, calming, muted colors
- **Industrial/utilitarian** — Functional, unadorned, practical

### 3. Constraints
- Technical requirements (framework, performance, accessibility)
- Tailwind v4 CSS-first, Shadcn UI components
- Next.js 16 App Router patterns
- Vietnamese UI text requirements

### 4. Differentiation
- What's the ONE thing someone will remember?
- What makes this UNFORGETTABLE?

**Key**: Choose a clear direction và execute with precision. Intentionality > intensity.

---

## ✨ Aesthetic Guidelines

### Typography
- **Choose distinctive fonts** — Avoid generic: Arial, Inter, Roboto, system fonts, Space Grotesk
- Pair a **characterful display font** với **refined body font**
- Repo fonts: Check `apps/web/public/fonts/` cho available options

### Color & Theme
- **Commit to cohesive palette** — Use CSS variables
- **Dominant colors with sharp accents** outperform timid, evenly-distributed palettes
- **Avoid**: purple gradients on white (AI slop)
- Use Tailwind tokens: `bg-background`, `text-foreground`, `border-border`, etc.

### Motion
- Focus on **high-impact moments**
- One well-orchestrated page load với staggered reveals (animation-delay) > scattered micro-interactions
- Use **scroll-triggering** và **hover states** that surprise
- Prioritize **CSS-only** for animations
- Use **Motion library** (Framer Motion) for React when available

### Spatial Composition
- **Unexpected layouts** — Asymmetry, overlap, diagonal flow
- **Grid-breaking elements** — Don't be predictable
- **Generous negative space** OR **controlled density**
- Match Tailwind spacing scale: `gap-4`, `gap-6`, `gap-8`

### Visual Details
Create atmosphere và depth:
- Gradient meshes, noise textures
- Geometric patterns, layered transparencies
- Dramatic shadows, decorative borders
- Custom cursors, grain overlays
- **Never default to solid colors**

---

## 🚫 Anti-Patterns (NEVER)

- **Generic fonts**: Inter, Roboto, Arial, system fonts, Space Grotesk
- **Cliched color schemes**: Purple gradients on white
- **Predictable layouts** và component patterns
- **Cookie-cutter design** lacking context-specific character
- **Converging on common choices** across generations
- **Hard-coding colors** — Use Tailwind tokens/CSS variables
- **English UI text** — Use Vietnamese via `next-intl`

---

## 🛠️ Implementation Guidelines

### Match Complexity to Vision

**Maximalist designs**:
- Elaborate code với extensive animations
- Custom CSS với complex effects
- Multiple motion sequences

**Minimalist/refined designs**:
- Restraint, precision
- Careful spacing và typography
- Subtle details với big impact

### Code Patterns

**Client Component (interactive)**:
```tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        'rounded-xl border bg-card p-6',
        'shadow-lg hover:shadow-xl transition-shadow',
        'dark:border-gray-700',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
```

**Server Component (data + layout)**:
```tsx
import { getBlogPosts } from '@/services/blog-service'
import { PostCard } from './post-card'

export async function BlogSection({ locale }: { locale: string }) {
  const { data: posts } = await getBlogPosts(locale, 'published', {
    page: 1,
    pageSize: 6,
  })
  
  return (
    <section className="container py-12">
      <h2 className="text-3xl font-bold tracking-tight mb-8">
        Bài viết mới nhất
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            className={index >= 3 ? 'lg:col-span-1' : undefined}
          />
        ))}
      </div>
    </section>
  )
}
```

### Responsive Design
```tsx
<div className="
  grid gap-4           // Mobile (default)
  md:grid-cols-2       // Tablet
  lg:grid-cols-3       // Desktop
  xl:gap-6             // Large screens
">
```

### Dark Mode
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

---

## 📝 Example Prompts

**Build a Hero Section**:
```text
"Create a hero section cho blog homepage:
1. Design direction: Brutally minimal với bold typography
2. Use large heading với refined body text
3. Add subtle entrance animation
4. Make responsive: mobile stack, desktop side-by-side"
```

**Redesign Dashboard Cards**:
```text
"Redesign dashboard cards:
1. Analyze current dashboard: take screenshot và analyze
2. Suggest: Card variants với hover effects, better spacing
3. Use Shadcn Card components + Tailwind
4. Add subtle motion on hover"
```

**Form Styling**:
```text
"Style contact form:
1. Design direction: Clean, professional với subtle accents
2. Focus on: Input focus states, error states, accessibility
3. Use Shadcn Form components
4. Add smooth transitions between states"
```

---

## 🔗 Related Skills

- [.github/skills/tailwind/SKILL.md](./tailwind/SKILL.md) — Tailwind CSS patterns
- [.github/skills/shadcn-ui/SKILL.md](./shadcn-ui/SKILL.md) — Shadcn patterns
- [.github/skills/i18n-next-intl-vi/SKILL.md](./i18n-next-intl-vi/SKILL.md) — Vietnamese UI
- [.github/skills/nextjs-app-router/SKILL.md](./nextjs-app-router/SKILL.md) — Next.js 16 patterns
- [.github/skills/minimax-nextjs-agent/SKILL.md](./minimax-nextjs-agent/SKILL.md) — MiniMax + Chrome DevTools

---

## 🎯 Remember

- **Vary between light và dark themes**
- **Different fonts, different aesthetics**
- **Never converge on common choices**
- **Interpret creatively** — Make unexpected choices that feel genuinely designed
- **You are capable of extraordinary creative work — don't hold back**
