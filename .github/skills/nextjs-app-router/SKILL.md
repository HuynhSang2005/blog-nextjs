---
name: nextjs-app-router
description: Next.js 16 App Router patterns for this repo (await params/searchParams, next-intl locale handling, Supabase DB-first via services).
---

# Next.js 16 App Router (Huỳnh Sang Blog)

## Khi nào dùng skill này
- Khi tạo/sửa route trong `apps/web/src/app/**`.
- Khi cần `generateMetadata`, caching (`revalidate`), hoặc route handlers.

## Checklist bắt buộc (Next.js 16)
- Luôn `await props.params` và `await props.searchParams`.
- Luôn gọi `setRequestLocale(locale)` cho page theo locale.
- UI text dùng `next-intl` (`getTranslations`/`useTranslations`).
- Data: DB-first qua `apps/web/src/services/*-service.ts` (không dùng Contentlayer cho blog/docs/projects).

## Pattern khuyến nghị
- Page props dạng `props: { params: Promise<...>; searchParams?: Promise<...> }`.
- `Promise.all([props.params, props.searchParams])` nếu cần cả hai.
- 404: dùng `notFound()` thay vì throw.

## Gợi ý repo-specific
- Blog: dùng `getBlogPosts`, `getBlogPost` từ `@/services/blog-service`.
- Docs: dùng `getPublicDocBySlug` từ `@/services/docs-service` + render runtime bằng `@/components/docs/mdx-remote`.

## Không được làm
- Không destructure `params` trực tiếp trong signature (vì `params` là Promise ở Next.js 16).
- Không hardcode English string cho UI.
- Không sửa `apps/web/src/lib/core/**` và `apps/web/src/components/ui/**`.
