---
name: tailwind
description: Quy ước Tailwind CSS trong repo này (Tailwind v4 CSS-first, tokens, cn(), không hardcode màu).
---

## Nguồn trong repo
- Global Tailwind entry + tokens: `apps/web/src/styles/globals.css`
- Class merge helper: `apps/web/src/lib/utils.ts` (`cn`)
- Shadcn UI (không sửa): `apps/web/src/components/ui/**`

## Tailwind v4 (CSS-first)
- Repo dùng `@import "tailwindcss";` trong `globals.css`.
- Plugins: `tailwindcss-animate`, `@tailwindcss/typography`.
- Theme tokens map qua CSS variables (`--color-*`) trong `@theme inline`.

## Quy tắc thiết kế
- Không hard-code màu/font/shadow mới trong component.
- Dùng tokens hiện có (`bg-background`, `text-foreground`, `border-border`, v.v.).
- Dùng `cn()` để merge class conditionally.

## Khi cần thêm styles
- Ưu tiên Tailwind utilities trước.
- Nếu cần utility riêng, cân nhắc pattern `@utility ...` trong `globals.css` (repo đã có).

## MDX styles
- MDX-related styles nằm ở `apps/web/src/styles/mdx.css` và `mdx-editor*.css`.
- Khi đổi typography, ưu tiên chỉnh trong các file này thay vì inline class rải rác.
