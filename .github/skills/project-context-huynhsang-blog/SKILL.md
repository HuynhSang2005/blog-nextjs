---
name: project-context-huynhsang-blog
description: Tóm tắt context repo Huỳnh Sang Blog (monorepo Next.js 16, Supabase DB-first, Cloudinary media, next-intl i18n, Bun/Biome). Dùng khi cần hiểu kiến trúc repo, tìm đúng chỗ để sửa, hoặc onboarding contributor.
---

# Context dự án: Huỳnh Sang Blog

## Khi nào dùng skill này
- Khi bạn nói: “giải thích kiến trúc repo”, “nên sửa ở đâu”, “luồng blog/docs/admin hoạt động thế nào”.
- Khi cần mapping nhanh: route → service → DB → UI component.

## Bản đồ nhanh (repo-specific)
- App Router: `apps/web/src/app/[locale]/...`
  - Site routes: `apps/web/src/app/[locale]/(site)/*`
  - Admin routes: `apps/web/src/app/[locale]/admin/*`
- Services (DB-first): `apps/web/src/services/*-service.ts`
  - Blog: `apps/web/src/services/blog-service.ts`
  - Docs: `apps/web/src/services/docs-service.ts`
- UI components:
  - Shared: `apps/web/src/components/*`
  - Shadcn UI (KHÔNG SỬA): `apps/web/src/components/ui/*`
- i18n messages: `apps/web/src/i18n/locales/vi.json`
- Supabase migrations: `apps/web/supabase/migrations/*`
- E2E tests: `apps/web/tests/*.spec.ts`

## Quy tắc “không được phá”
- UI text luôn là Tiếng Việt qua `next-intl` (thuật ngữ kỹ thuật giữ English).
- Next.js 16: luôn `await params` và `await searchParams` trong page.
- Source of truth: Supabase cho blog/docs/projects (không Contentlayer).
- Media file ở Cloudinary, DB chỉ lưu metadata/reference.
- Không sửa: `apps/web/src/lib/core/**` và `apps/web/src/components/ui/**`.

## Workflow tool (khi cần verify)
- Repo ops: Serena (tìm file/symbol trước khi đọc cả file).
- Library docs: Context7.
- Web research: Perplexity.
- Database: Supabase MCP (DDL → migration; query/debug → SQL).

## Gợi ý cách làm việc hiệu quả
1. Xác định nơi sửa: route (app) → component → service → DB.
2. Dùng search (workspace) để tìm usage trước khi sửa API.
3. Sau khi đổi API/signature: cập nhật mọi references.
