---
name: next-intl
description: Cách dùng next-intl trong Next.js 16 App Router của repo này (Vietnamese UI, server/client patterns, locale routing).
---

## Nguồn trong repo
- Request config (merge messages + fallback): `apps/web/src/i18n/request.ts`
- Locale messages: `apps/web/src/i18n/locales/*.json` (ưu tiên `vi.json`)
- Usage examples: nhiều components dùng `getTranslations`/`useTranslations`.

## Quy tắc bắt buộc
- UI text phải tiếng Việt qua `next-intl` (không hardcode English strings).
- Next.js 16: luôn `await params` và `await searchParams` trong pages.

## Server vs Client
### Server Components
- Dùng `getTranslations('namespace')`:
  - `const t = await getTranslations('site')`
- Nếu cần locale cụ thể: `getTranslations({ locale, namespace })` (đã có pattern trong repo).

### Client Components
- Dùng `useTranslations('namespace')` và/hoặc `useLocale()`.
- Chỉ thêm `'use client'` khi có state/effect/event handlers.

## Messages loading
- `request.ts` merge fallback messages từ default locale + locale hiện tại.
- Khi thêm key mới, update `apps/web/src/i18n/locales/vi.json` (và locale khác nếu có).

## Routing
- Locale list/config nằm ở config/routing (được import trong `request.ts`).
- Khi tạo route mới dưới `app/[locale]/...`, đảm bảo text UI qua i18n.
