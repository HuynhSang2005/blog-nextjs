---
name: i18n-next-intl-vi
description: Quy ước i18n (Vietnamese-first UI) với next-intl trong repo Next.js 16 này.
---

# i18n (Vietnamese-first) với next-intl

## Khi nào dùng skill này
- Khi thêm/sửa UI text, form labels, messages.
- Khi tạo page/layout theo locale.

## Quy tắc
- UI text luôn Tiếng Việt qua `apps/web/src/i18n/locales/vi.json`.
- Thuật ngữ kỹ thuật giữ tiếng Anh (Next.js, React, API, RLS...).

## Patterns
- Server Component: `const t = await getTranslations('namespace')`.
- Client Component: `const t = useTranslations('namespace')`.
- Page theo locale: `setRequestLocale(locale)`.

## Không được làm
- Không hardcode English string cho UI.
- Không dùng `'use client'` nếu không cần state/effect/event handlers.
