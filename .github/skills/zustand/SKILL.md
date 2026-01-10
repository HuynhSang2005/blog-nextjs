---
name: zustand
description: Cách dùng Zustand v5 trong repo này (persist middleware, subscribeWithSelector, UI state only).
---

## Trạng thái hiện tại

- **Đã cài đặt**: `zustand` v5.0.9 trong `apps/web/package.json`
- **Stores**:
  - `apps/web/src/stores/ui-store.ts` — UI state (theme, sidebar, etc.)
  - `apps/web/src/stores/admin-store.ts` — Admin dashboard state

## Khi nào dùng Zustand

- **UI state đơn giản**: mở/đóng panel, selection tạm, theme, sidebar
- **Client-only state**: không có server data (không phải source of truth cho DB)
- **Cần persist**: lưu state qua reload (dùng persist middleware)

**Không dùng khi**:
- Server-state (fetch từ API/DB) → dùng **TanStack Query**
- i18n/permissions/RLS → xử lý ở tầng khác

## Pattern bắt buộc

### 1. Store với Persist Middleware
```typescript
import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

interface UiState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        theme: 'light',
        sidebarOpen: true,
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
      }
    )
  )
)
```

### 2. Partialize (QUAN TRỌNG)
- Chỉ persist field cần thiết, tránh persist cả store
- `partialize`: lọc field trước khi lưu vào localStorage

### 3. Subscribe với Selector
```typescript
// Trong component
useUiStore.subscribeWithSelector((state) => state.theme), (theme) => {
  // React khi theme thay đổi
  document.documentElement.classList.toggle('dark', theme === 'dark')
})
```

## Tránh

- Nhét data từ DB vào store như source of truth.
- Dùng Zustand để né i18n/permissions/RLS.
- Tạo store mới không cần thiết.
- Persist cả store thay vì dùng partialize.
