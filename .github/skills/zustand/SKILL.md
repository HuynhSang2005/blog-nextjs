---
name: zustand
description: (Tuỳ chọn) Hướng dẫn dùng Zustand cho client state nếu repo cần. Lưu ý: hiện chưa thấy zustand trong dependencies.
---

## Trạng thái hiện tại
- `apps/web/package.json` chưa có `zustand`.

## Khi nào cân nhắc thêm
- Cần global client state đơn giản (UI state: mở/đóng panel, selection tạm, draft state), không phải server-state.
- Nếu là server-state (fetch từ API/DB), ưu tiên React Query.

## Cách thêm (nếu quyết định dùng)
- Cài đặt: `bun add zustand`
- Tạo store trong `apps/web/src/stores/` (tạo folder nếu chưa có).

## Pattern tối giản
- Store chỉ chạy client. Component dùng store sẽ là `'use client'`.
- Giữ state nhỏ và tách domain rõ ràng.

## Tránh
- Không nhét data từ DB vào store như source of truth.
- Không dùng Zustand để né i18n/permissions/RLS.
