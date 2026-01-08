---
name: cloudinary-media
description: Làm việc với media theo pattern repo (Cloudinary lưu file, Supabase lưu metadata/reference). Dùng khi hiển thị ảnh cover, tối ưu ảnh, hoặc thao tác media trong admin.
---

# Cloudinary + Media (repo pattern)

## Khi nào dùng skill này
- Khi bạn nói: “Cloudinary”, “ảnh cover”, “media metadata”, “tối ưu ảnh”, “CldImage”.

## Quy tắc kiến trúc
- File ảnh/video: Cloudinary.
- Metadata/reference: Supabase table `media` (không hardcode secrets/keys).

## UI pattern
- Dùng `next-cloudinary` (`CldImage`) để render ảnh khi có `cloudinary_public_id` và kích thước.
- `alt` ưu tiên: `alt_text` (nếu có) → fallback `title`.

## Checklist trước khi merge
- Không thêm URL Cloudinary hardcode (tạo từ metadata/reference).
- Không commit bất kỳ secret nào.
- Nếu cần thay đổi schema media: dùng Supabase MCP `apply_migration`.
