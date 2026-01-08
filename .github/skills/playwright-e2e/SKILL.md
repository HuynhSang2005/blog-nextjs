---
name: playwright-e2e
description: Cách chạy và viết E2E tests (Playwright) theo cấu trúc repo này.
---

# Playwright E2E

## Khi nào dùng skill này
- Khi sửa các flow admin/blog/docs và cần verify end-to-end.

## Repo cấu trúc
- Tests: `apps/web/tests/*.spec.ts`.
- Helpers: `apps/web/tests/_helpers/*`.

## Workflow gợi ý
- Chạy test tập trung theo file/spec trước.
- Ưu tiên assert theo UI/behavior thay vì implementation details.

## Không được làm
- Không sửa test không liên quan nếu không được yêu cầu.
- Không bỏ qua flaky test bằng cách nới timeout bừa bãi; ưu tiên tìm nguyên nhân.
