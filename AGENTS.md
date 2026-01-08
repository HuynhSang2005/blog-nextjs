# Huỳnh Sang Blog — AGENTS

Mục tiêu của file này: cung cấp **hướng dẫn ngắn, đủ dùng** cho AI Agent khi làm việc với repo. Các tài liệu trong `docs/` thay đổi liên tục, vì vậy file này chỉ giữ những “quy tắc không được phá” và workflow chuẩn.

**Last Updated**: January 3, 2026

---

## 1) Quy tắc bắt buộc

- **Ngôn ngữ UI**: Tất cả text UI phải là **Tiếng Việt** qua `next-intl` và `apps/web/src/i18n/locales/vi.json`. Thuật ngữ kỹ thuật giữ tiếng Anh (Next.js, React, API, RLS, ...).
- **Next.js 16**: Luôn `await params` và `await searchParams` trong App Router.
- **Server Components mặc định**: Chỉ dùng `'use client'` khi cần state/effect/event handlers/browser APIs.
- **Package manager**: dùng **Bun**. Không dùng npm/yarn/pnpm.
- **Lint/format**: dùng **Biome** (không ESLint/Prettier).

---

## 2) Nguồn dữ liệu (source of truth)

- **Blog posts**: Supabase (DB-first). Không lấy blog từ MDX/Contentlayer.
- **Docs**: Supabase (DB-first) và render MDX runtime.
- **Projects**: Supabase (DB-first) và có thể render MDX runtime cho nội dung dài.
- **Media**: Cloudinary lưu file; Supabase `media` chỉ lưu metadata + reference.

Ghi chú: Contentlayer/MDX trong repo (nếu còn) được xem như **legacy/seed**, chỉ dùng khi bạn được yêu cầu làm việc với `apps/content/**` hoặc khi đang sửa các phần legacy (vd: sitemap/feed cũ).

---

## 3) Bắt buộc dùng MCP/tools theo workflow

- **Luôn dùng Serena MCP** (folder `.serena/` ở root) cho mọi tác vụ liên quan repo: tìm file, đọc code, tìm symbol, chỉnh sửa có kiểm soát.
- **Khi làm DB Supabase**: dùng **Supabase MCP**
  - DDL/migration: `apply_migration`
  - Query/debug dữ liệu: `execute_sql`
  - Theo dõi advisory/logs khi cần.
- **Khi cần tra cứu/verify**:
  - **Context7 MCP**: tra docs/code snippet thư viện.
  - **Perplexity MCP**: tra cứu web/so sánh/cập nhật mới.
  - **Search của GitHub Copilot/VS Code**: tra cứu trong workspace.

## 3.1) Agent Skills (khuyến nghị)

- Skill dùng cho workflow lặp lại, chuyên biệt (testing, Supabase, i18n...).
- Vị trí: `.github/skills/<skill-name>/SKILL.md`.
- Giữ skill nhỏ gọn, tập trung 1 chủ đề; thêm script/example vào cùng folder khi cần.

---

## 4) Không được sửa (project boundaries)

- `apps/web/src/lib/core/**` (core utilities — immutable)
- `apps/web/src/components/ui/**` (Shadcn UI — không sửa tay, regenerate nếu cần)
- `apps/web/contentlayer.config.ts` (trừ khi có yêu cầu rõ ràng)
- `packages/**`, `turbo.json`, `.husky/**` (trừ khi có yêu cầu rõ ràng)

---

## 5) Conventions nhanh

- TypeScript strict: **không dùng `any`** (dùng `unknown` khi cần).
- Prefer `interface` cho object shapes.
- Styling: Tailwind + `cn()`.
- Text UI: không hardcode English string; dùng `next-intl`.

---

## 6) Lệnh dev thường dùng


## 8) Knowns CLI (tuỳ chọn)

Nếu bạn dùng Knowns để quản lý task/docs/time tracking, xem hướng dẫn ngắn gọn tại `.github/instructions/knowns-cli.instructions.md`.

Nguyên tắc: dùng Knowns cho **quản lý công việc & kiến thức**, còn thao tác repo/DB vẫn theo workflow chuẩn của repo (Serena + Supabase MCP).

