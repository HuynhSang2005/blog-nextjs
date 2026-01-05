# Project Overview (blog-nextjs)

## Purpose
- Monorepo blog/portfolio platform (Vietnamese-first UI) built with Next.js App Router.
- Content strategy (DB-first):
  - Blog posts / Docs / Projects: Supabase database (CRUD via /{locale}/admin/*)
- Media: Cloudinary (store files) + Supabase `media` table (store metadata).

## Tech stack
- Next.js 16 + React 19 + TypeScript (strict)
- Turborepo monorepo
- Bun as package manager (repo expects Bun >= 1.3.5)
- Biome for lint/format
- next-intl for i18n (Vietnamese-first)
- Supabase for DB + Auth + RLS
- Shadcn UI components in `apps/web/src/components/ui` (do not edit; regenerate via CLI)

## Repo structure (high level)
- `apps/web`: main Next.js app (App Router under `src/app/[locale]/`)
- `docs/dev-v1`: implementation guides + manual test reports
- `apps/web/supabase/migrations`: DB migrations
