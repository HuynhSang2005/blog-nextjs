# Kế hoạch tối ưu MDX (DB-first, Supabase) + loại bỏ Contentlayer (nếu cần)

## Mục tiêu
- Giảm chi phí runtime (TTFB/CPU) cho docs/blog/projects render MDX.
- Chuẩn hóa output từ admin MDX editor để render runtime ổn định.
- (Tuỳ chọn) Loại bỏ Contentlayer & `apps/content` nếu đã migrate các điểm phụ thuộc.

## Nguyên tắc
- Source of truth: Supabase (docs/blog/projects).
- UI text tiếng Việt (next-intl).
- Không thêm feature UX ngoài scope; chỉ tối ưu pipeline/caching/precompute.

---

## Phase 0 — Baseline & đo đạc (nhanh)
**Kết quả cần có:** hiểu rõ chỗ nào đang tốn CPU và tần suất.

Checklist:
- [ ] Xác định pages nào render MDX runtime: docs/blog/projects.
- [ ] Xác định nơi tính TOC runtime đang được gọi.
- [ ] Thống kê độ dài MDX trung bình (docs/blog/projects) để ước lượng cost.

Acceptance:
- Có bảng hotspots + trigger + hướng tối ưu.

---

## Phase 1 — Precompute khi publish (Supabase flow)
**Mục tiêu:** chuyển các transform "đắt" nhưng deterministic sang publish-time.

### 1.1 Trường dữ liệu đề xuất (cho bảng docs/blog/projects)
Tối thiểu nên có (có thể tách bảng riêng `content_artifacts` nếu muốn):
- `content` (MDX string, source)
- `content_hash` (hash của `content`, ví dụ SHA-256)
- `excerpt` (string) — mô tả ngắn
- `reading_time_minutes` (int)
- `toc` (jsonb) — danh sách headings đã normalize
  - gợi ý shape: `[{ id: string; depth: number; value: string }]`
- `headings` (jsonb) — nếu cần chi tiết hơn TOC
- `search_text` (text) — plain text để full-text search

Optional (nâng cao):
- `compiled_at` (timestamptz)
- `artifacts_version` (int) để invalidate khi đổi pipeline

### 1.2 Nơi chạy precompute
Chọn 1 trong 2 (ưu tiên đơn giản):
- A) Server Action / API route trong Next.js admin: khi bấm "Xuất bản" → compute artifacts → update row.
- B) Supabase Edge Function: admin gọi function, function compute + update.

### 1.3 Logic precompute cần có
- [ ] Validate MDX: cấm/strip `import`/`export` top-level (đồng bộ với `strip-mdx-esm`).
- [ ] Compute TOC từ content (remark pipeline) và lưu `toc`.
- [ ] Compute `search_text` (strip markdown/JSX → text), lưu để search.
- [ ] Compute `reading_time_minutes`.
- [ ] Compute `excerpt` nếu chưa có.

Acceptance:
- TOC không còn phải compute runtime cho docs/blog/projects.
- Mỗi lần publish/update content đều cập nhật `content_hash` + artifacts.

---

## Phase 2 — Runtime caching (Next.js)
**Mục tiêu:** giảm lặp compute trong cùng revalidate window.

Checklist:
- [ ] Cache query Supabase theo slug/locale (dùng `unstable_cache` hoặc `cache` tuỳ pattern hiện có).
- [ ] Thiết lập `revalidate` hợp lý theo loại nội dung:
  - docs: revalidate dài hơn (vd 10–60 phút) nếu ít thay đổi
  - blog: tuỳ tần suất
  - projects: tương tự docs
- [ ] Nếu TOC đã precompute: bỏ gọi `toc.ts` runtime.

Acceptance:
- TTFB ổn định hơn; CPU server giảm cho route docs/blog/projects.

---

## Phase 3 — Chuẩn hoá MDX Editor output
**Mục tiêu:** editor tạo ra MDX "hợp chuẩn" với runtime renderer.

Checklist:
- [ ] Quy định: không dùng ESM import/export trong content DB.
- [ ] Quy định: component JSX chỉ trong whitelist (Callout/Steps/Tabs...).
- [ ] Kiểm tra các template snippet của editor có tương thích mapping trong `mdx-remote.tsx`.

Acceptance:
- Content tạo từ editor luôn render được ở server.

---

## Phase 4 (Tuỳ chọn) — Loại bỏ Contentlayer & `apps/content`
**Mục tiêu:** bỏ pipeline file-based nếu đã không còn dùng.

### 4.1 Những chỗ hiện còn phụ thuộc Contentlayer
(đã xác nhận trong codebase)
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/[locale]/(site)/feed/[feed]/route.ts`
- `apps/web/src/app/[locale]/(site)/blog/og/[slug]/route.tsx`
- `apps/web/src/components/command-menu.tsx`

### 4.2 Kế hoạch migrate
- [x] Sitemap: thay `allDocs/allBlogs` → query Supabase lấy `slug` của docs/blog published theo locale.
- [ ] Feed RSS/JSON: thay `allBlogs` → query Supabase lấy fields tối thiểu (title, excerpt, slug, published_at, author).
- [ ] OG image route: thay lookup Contentlayer → query Supabase theo slug/locale.
- [ ] Command menu: thay `allBlogs` → query Supabase (có cache) hoặc index table để search.

### 4.3 Sau khi migrate
- [ ] Xoá import `contentlayer/generated` ở các file trên.
- [ ] Gỡ `contentlayer:build` khỏi build pipeline của `apps/web`.
- [ ] Xoá `apps/web/contentlayer.config.ts` (hoặc giữ nhưng không dùng).
- [ ] Xoá dependency `contentlayer2`, `next-contentlayer2` nếu không còn reference.
- [ ] Khi đã sạch phụ thuộc: mới xoá `apps/content/**`.

Acceptance:
- `apps/web` build không chạy contentlayer nữa.
- Không còn import từ `contentlayer/generated`.
- `apps/content` có thể xoá mà không break sitemap/feed/og/command-menu.
