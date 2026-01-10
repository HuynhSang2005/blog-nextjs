import { create } from 'zustand'

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

export const useUIStore = create<UIState>()(set => ({
  sidebarOpen: true,
  theme: 'light',
  isModalOpen: false,
  modalContent: null,
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: theme => set({ theme }),
  openModal: content => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}))
