import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  isModalOpen: boolean
  modalContent: string | null
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  openModal: (content: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector(
    persist(
      set => ({
        sidebarOpen: true,
        theme: 'light',
        isModalOpen: false,
        modalContent: null,
        toggleSidebar: () =>
          set(state => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: theme => set({ theme }),
        openModal: content => set({ isModalOpen: true, modalContent: content }),
        closeModal: () => set({ isModalOpen: false, modalContent: null }),
      }),
      {
        name: 'blog-ui-storage', // localStorage key
        storage: createJSONStorage(() => localStorage),
        partialize: state => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
)
