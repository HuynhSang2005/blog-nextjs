import { create } from 'zustand'

interface AdminState {
  selectedPostId: string | null
  selectedProjectId: string | null
  selectedDocId: string | null
  selectedTagId: string | null
  isEditing: boolean
  setSelectedPost: (id: string | null) => void
  setSelectedProject: (id: string | null) => void
  setSelectedDoc: (id: string | null) => void
  setSelectedTag: (id: string | null) => void
  setEditing: (editing: boolean) => void
  reset: () => void
}

export const useAdminStore = create<AdminState>()(set => ({
  selectedPostId: null,
  selectedProjectId: null,
  selectedDocId: null,
  selectedTagId: null,
  isEditing: false,
  setSelectedPost: id => set({ selectedPostId: id }),
  setSelectedProject: id => set({ selectedProjectId: id }),
  setSelectedDoc: id => set({ selectedDocId: id }),
  setSelectedTag: id => set({ selectedTagId: id }),
  setEditing: editing => set({ isEditing: editing }),
  reset: () =>
    set({
      selectedPostId: null,
      selectedProjectId: null,
      selectedDocId: null,
      selectedTagId: null,
      isEditing: false,
    }),
}))
