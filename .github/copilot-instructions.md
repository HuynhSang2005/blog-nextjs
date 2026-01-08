# GitHub Copilot Instructions

> Custom instructions for GitHub Copilot when working on Huỳnh Sang Blog

## Project Snapshot

- Next.js 16 (App Router) + React 19 + TypeScript
- Monorepo (Turborepo)
- Package manager: **Bun**
- Lint/format: **Biome** (no ESLint/Prettier)
- Data: **Supabase DB-first** (blog/docs/projects) + **Cloudinary** (media files)
- i18n: **next-intl**, UI text Vietnamese-first

## Non-negotiables

1) Next.js 16 `params`/`searchParams`: treat as Promises and always `await` them.
2) Server Components by default: only add `'use client'` when required.
3) DB-first content: blog/docs/projects come from Supabase (docs stored as MDX string, rendered at runtime).
4) Do not modify generated/immutable areas:
	- `apps/web/src/components/ui/**` (shadcn)
	- `apps/web/src/lib/core/**`
5) No secrets: never hardcode keys/tokens; never commit `.env*.local`.

## Repo workflow

- Repo exploration/edits: prefer Serena-style search/symbol navigation.
- Database DDL: use Supabase migrations tooling.
- Library/API uncertainty: verify via Context7 docs before guessing.

## Knowns CLI (optional)

Keep this file minimal. For Knowns workflow/commands, follow:
`.github/instructions/knowns-cli.instructions.md`

