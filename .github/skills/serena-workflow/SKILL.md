---
name: serena-workflow
description: Workflow repo ops bằng Serena MCP (tìm file, đọc symbol, chỉnh sửa có kiểm soát) để giảm đọc thừa.
---

# Serena MCP Workflow

## Khi nào dùng skill này
- Bất cứ khi nào cần khám phá repo, tìm code, hoặc chỉnh sửa code.

## Quy tắc
- Ưu tiên `get_symbols_overview`/`find_symbol` thay vì đọc cả file.
- Dùng `search_for_pattern` để định vị nhanh trước khi đọc.
- Khi đổi API: dùng `find_referencing_symbols` để cập nhật mọi nơi sử dụng.

## Thực hành tốt
- Chỉ đọc phần đủ để làm task.
- Sau khi thu thập thông tin đủ: dừng và xác nhận hướng sửa.
