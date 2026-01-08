---
name: mdx-runtime
description: Render và xử lý nội dung MDX runtime trong repo (docs/blog/projects), dùng MdxRemote + next-mdx-remote-client. Dùng khi làm nội dung MDX, sanitize, hoặc map components cho MDX.
---

# MDX runtime

## Khi nào dùng skill này
- Khi bạn nói: “render MDX từ database”, “MDX Remote”, “docs content”, “MDX components”, “sanitize MDX”.

## Repo patterns
- Component render MDX: `apps/web/src/components/docs/mdx-remote.tsx` (export `MdxRemote`).
- Data source: Supabase (nội dung MDX string trong DB), fetch qua `apps/web/src/services/docs-service.ts` (docs) và `apps/web/src/services/blog-service.ts` (blog nếu có content MDX).

## Checklist khi render MDX
- Ưu tiên Server Component.
- Nội dung đến từ DB: luôn xử lý theo pattern hiện có (sanitization/transform) trước khi render.
- Dùng `MdxRemote` thay vì tự `dangerouslySetInnerHTML`.

## Khi sửa/extend MDX components
- Tìm `components` mapping trong `apps/web/src/components/docs/mdx-remote.tsx`.
- Chỉ thêm mapping tối thiểu cần thiết.
- UI text (nếu có) phải lấy từ `next-intl` và tiếng Việt.

## Không được làm
- Không render raw HTML trực tiếp từ DB bằng `dangerouslySetInnerHTML`.
- Không tự ý thay đổi pipeline MDX (remark/rehype) nếu không có yêu cầu rõ ràng; ưu tiên theo pattern đang dùng.
