# Conventions & Constraints

## UI language
- All user-facing UI text must be Vietnamese (use `apps/web/src/i18n/locales/vi.json`).
- Keep technical terms in English (Next.js, React, API, etc.).

## Next.js 16 patterns
- `params` and `searchParams` in App Router pages are Promises and must be awaited.
- Prefer Server Components; use `'use client'` only when needed (events/hooks/browser APIs).

## Imports / styling
- Use path aliases (`@/...`).
- Tailwind for styling; merge classes via `cn()`.

## Supabase / Content strategy
- Blog posts/projects/docs (target): database-first via Supabase.
- MDX render runtime (DB-first): lưu MDX string trong DB và render runtime (RSC) theo mapping + sanitizer.

## Git workflow
- Không commit bất kỳ file nào trong `docs/**`.

## Do not modify
- `apps/web/src/lib/core/**`
- `apps/web/src/components/ui/**` (shadcn)
- `packages/**`, `turbo.json`, `.husky/**`
