# MDX trong Next.js App Router (Next.js 16) — Hướng dẫn thực chiến (Supabase-first)

## Khi nào nên dùng MDX trong hệ thống DB-first
Phù hợp khi:
- Nội dung có cấu trúc (heading, lists, code blocks).
- Cần "interactive islands" qua component mapping (Callout/Steps/Tabs...).
- Cần editor WYSIWYG/MDX editor trong admin.

Không phù hợp khi:
- Nội dung chỉ cần HTML tĩnh đơn giản (có thể dùng rich-text HTML/Portable Text).
- Cần chạy `import`/`export` module trong content (không nên trong DB-first content).

## Pattern khuyến nghị trong repo
- Lưu content dạng **MDX string** trong Supabase.
- Render runtime ở Server Components bằng `next-mdx-remote-client/rsc`.
- Dùng component mapping tập trung để kiểm soát UI.

## Quy chuẩn content (quan trọng)
### 1) Cấm ESM import/export trong content lưu DB
Lý do:
- Runtime compile/evaluate có thể lỗi.
- Nguy cơ bề mặt tấn công tăng nếu cho phép runtime import.

Repo đã có sanitizer `strip-mdx-esm` để loại các dòng `import`/`export` top-level (ngoài fenced code block).

### 2) Chỉ cho phép JSX component trong whitelist
Ví dụ whitelist thường gặp:
- `Callout`, `Steps`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

Mục tiêu:
- Dễ validate khi publish.
- Dễ maintain mapping trong renderer.

## Hiệu năng: những thứ nên precompute khi publish
Hotspots runtime thường là:
- Compile/render MDX
- Parse MDX để lấy TOC/headings

Khuyến nghị publish-time (deterministic, ổn định):
- `toc` (jsonb)
- `reading_time_minutes`
- `excerpt`
- `search_text` (plain text cho search)
- `content_hash` để cache/invalidate

Runtime chỉ cần:
- Query Supabase (có cache/revalidate)
- Render MDX

## SEO (tóm tắt)
- Render ở server (RSC) giúp SEO tốt vì nội dung ra HTML.
- Nếu dùng `revalidate`, cần đảm bảo metadata cũng dùng cùng nguồn (Supabase).
- Với docs/blog, ưu tiên stable URL + canonical + sitemap/feed đều phải dựa trên Supabase nếu đã DB-first.

## Editor compatibility (Admin)
- `@mdxeditor/editor` là client-only: nên dynamic import để tránh SSR.
- Cần đảm bảo editor template/snippet khớp component mapping runtime.
- Nên có bước validate + precompute khi bấm "Xuất bản".

## Note về legacy Contentlayer
Repo hiện vẫn còn dùng Contentlayer cho một số chức năng phụ như sitemap/feed/og/command-menu.
Nếu muốn xoá `apps/content`, cần migrate các chỗ này sang Supabase trước (xem `docs/dev-mdx/docs-plan.md`).
