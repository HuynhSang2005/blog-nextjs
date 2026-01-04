# MDX trong Next.js (App Router) — Hotspots & hướng tối ưu (Supabase-first)

## Mục tiêu
- Liệt kê các "MDX hotspots" trong `apps/web/src/**` (điểm parse/compile/transform chạy thường xuyên).
- Đề xuất chiến lược **precompute khi publish** (Supabase flow) và **cache ở runtime**.
- Chốt hướng xử lý phần legacy `Contentlayer`/`apps/content` để tránh nhầm "DB-first" nhưng build vẫn phụ thuộc file MDX.

## Kiến trúc hiện tại (tóm tắt)
- Nguồn dữ liệu chính (pages): **Supabase**
  - Docs: `apps/web/src/app/[locale]/(site)/docs/[[...slug]]/page.tsx`
  - Blog: `apps/web/src/app/[locale]/(site)/blog/[slug]/page.tsx`
  - Projects: `apps/web/src/app/[locale]/(site)/projects/[slug]/page.tsx`
- Render MDX runtime: `next-mdx-remote-client/rsc`
  - Wrapper: `apps/web/src/components/docs/mdx-remote.tsx`
  - Sanitizer: `apps/web/src/lib/mdx/strip-mdx-esm.ts`
- TOC runtime: `apps/web/src/lib/core/utils/toc.ts` (remark + mdast-util-toc)
- Admin editor: `apps/web/src/components/admin/shared/mdx-editor.tsx` (client-only) dùng `@mdxeditor/editor`

## MDX hotspots (tập trung parse/compile/transform)

### 1) Compile/render MDX runtime (Server)
- Điểm vào: `apps/web/src/components/docs/mdx-remote.tsx`
- Trigger:
  - Docs page render
  - Blog post page render
  - Projects page render
- Cost profile:
  - Mức chi phí phụ thuộc độ dài MDX và số lượng component mapping.
  - Vì chạy trong Server Components (RSC), chi phí này sẽ lặp lại theo cache/revalidate.
- Ghi chú:
  - Wrapper hiện có bước `stripMdxEsm(source)` để loại bỏ `import`/`export` top-level (tránh runtime MDX bị lỗi).

### 2) Strip ESM trong MDX (Server)
- Điểm vào: `apps/web/src/lib/mdx/strip-mdx-esm.ts`
- Trigger: mọi lần render MDX qua wrapper
- Cost profile: tuyến tính theo số dòng; tương đối rẻ
- Value: cực cao (đảm bảo MDX lưu DB an toàn/ổn định hơn trong runtime compile)

### 3) Tạo TOC bằng remark pipeline (Server)
- Điểm vào: `apps/web/src/lib/core/utils/toc.ts`
- Trigger: docs/blog/projects page (nếu gọi TOC trong page)
- Cost profile:
  - Là một unified/remark parse + walk AST → thường là hotspot nặng thứ 2 sau compile MDX.
- Observed issue pattern:
  - Nếu TOC luôn được tính runtime từ raw MDX thì khó scale khi nội dung dài (docs dài, nhiều heading).

### 4) Pipeline rehype/remark cho code-block (Build-time, Contentlayer)
- Điểm vào: `apps/web/contentlayer.config.ts`
  - `rehype-pretty-code`, `rehype-slug`, `rehype-autolink-headings`, `remark-gfm`, `remark-code-import`, custom `rehype-npm-command`
- Trigger: `contentlayer2 build` (hiện đang chạy trong script build của `apps/web`)
- Cost profile:
  - Chi phí build-time (không ảnh hưởng TTFB trực tiếp), nhưng ảnh hưởng tốc độ build & độ phức tạp hệ thống.
- Note quan trọng:
  - Đây là lý do một số component docs (vd: pre/copy) thường kỳ vọng props do rehype plugins "inject".

### 5) Admin MDX editor (Client bundle)
- Điểm vào: `apps/web/src/components/admin/shared/mdx-editor.tsx`
- Trigger: chỉ trang admin
- Cost profile:
  - Nặng ở bundle client (dynamic import đúng hướng), không phải server hotspot.
- Risk:
  - Editor có thể tạo MDX có `import`/`export` hoặc JSX/directives → cần quy chuẩn & validator trong flow publish.

## Kết luận nhanh
- Hotspots ảnh hưởng runtime nhiều nhất:
  1) Compile/render MDX runtime (`MDXRemote` trong RSC)
  2) Tính TOC bằng remark runtime
- Tối ưu hiệu quả nhất theo DB-first:
  - **Precompute TOC/metadata khi publish** → giảm CPU per-request.
  - Runtime chỉ làm "render MDX" (và tận dụng Next cache/revalidate).

## Trạng thái `apps/content` / Contentlayer (thực tế hiện tại)
Hiện tại repo vẫn có các điểm dùng `contentlayer/generated` trong runtime/build:
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/[locale]/(site)/feed/[feed]/route.ts`
- `apps/web/src/app/[locale]/(site)/blog/og/[slug]/route.tsx`
- `apps/web/src/components/command-menu.tsx`

=> **Không nên xóa `apps/content` ngay** nếu chưa migrate các endpoints/tính năng này sang Supabase.
