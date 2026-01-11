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

### 1. Store với Persist Middleware (CẬP NHẬT)
```typescript
import { create } from 'zustand'
import { persist, subscribeWithSelector, createJSONStorage } from 'zustand/middleware'

interface UiState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
}

type PersistedState = Pick<UiState, 'theme' | 'sidebarOpen'>

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
        storage: createJSONStorage(() => localStorage),
        partialize: (state): PersistedState => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
)
```

### 2. Partialize (QUAN TRỌNG)
- Chỉ persist field cần thiết, tránh persist cả store
- `partialize`: lọc field trước khi lưu vào localStorage

### 3. Persist Middleware Runtime API (NEW)

**Access và modify persist options tại runtime:**

```typescript
// Get current options
const storageName = useUiStore.persist.getOptions().name
// Output: 'ui-storage'

// Update options at runtime
useUiStore.persist.setOptions({
  name: 'new-storage-name',
  storage: createJSONStorage(() => sessionStorage),
})
```

### 4. Subscribe với Selector
```typescript
// Trong component
useUiStore.subscribeWithSelector((state) => state.theme), (theme) => {
  // React khi theme thay đổi
  document.documentElement.classList.toggle('dark', theme === 'dark')
})
```

## Migration v4 → v5

**API không thay đổi, nhưng import cập nhật:**

```typescript
// v4
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// v5 - thêm createJSONStorage
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Code logic giữ nguyên
const store = create<State>()(
  persist(
    (set) => ({ ... }),
    { name: 'storage-key' }
  )
)
```

## Tránh

- Nhét data từ DB vào store như source of truth.
- Dùng Zustand để né i18n/permissions/RLS.
- Tạo store mới không cần thiết.
- Persist cả store thay vì dùng partialize.
