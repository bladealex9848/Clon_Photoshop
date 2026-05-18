import { create } from 'zustand'

interface DocumentState {
  name: string
  width: number
  height: number
  setName: (name: string) => void
  setSize: (width: number, height: number) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  name: 'Proyecto sin titulo',
  width: 1920,
  height: 1080,
  setName: (name) => set({ name }),
  setSize: (width, height) =>
    set({
      width: Math.max(1, Math.round(width)),
      height: Math.max(1, Math.round(height)),
    }),
}))
