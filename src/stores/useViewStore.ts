import { create } from 'zustand'
import type { Guide, ViewState } from '@/types'
import { DEFAULT_VIEW, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/constants'

interface ViewStoreState extends ViewState {
  guides: Guide[]

  // Actions
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomTo: (zoom: number) => void
  fitToScreen: (canvasWidth: number, canvasHeight: number, containerWidth: number, containerHeight: number) => void
  actualSize: () => void
  setPan: (x: number, y: number) => void
  addPan: (dx: number, dy: number) => void
  resetPan: () => void
  addGuide: (orientation: 'horizontal' | 'vertical', position: number) => void
  removeGuide: (id: string) => void
  moveGuide: (id: string, position: number) => void
  clearGuides: () => void
  toggleRulers: () => void
  toggleGuides: () => void
  toggleGrid: () => void
  setGridSize: (size: number) => void
  toggleSnapToGuides: () => void
  toggleSnapToGrid: () => void
}

export const useViewStore = create<ViewStoreState>((set, get) => ({
  ...DEFAULT_VIEW,
  guides: [],

  setZoom: (zoom: number) => {
    set({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) })
  },

  zoomIn: () => {
    const current = get().zoom
    const steps = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32]
    const nextStep = steps.find((s) => s > current) || MAX_ZOOM
    set({ zoom: nextStep })
  },

  zoomOut: () => {
    const current = get().zoom
    const steps = [0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 32].reverse()
    const nextStep = steps.find((s) => s < current) || MIN_ZOOM
    set({ zoom: nextStep })
  },

  zoomTo: (zoom: number) => {
    set({ zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) })
  },

  fitToScreen: (canvasWidth, canvasHeight, containerWidth, containerHeight) => {
    const padding = 50
    const scaleX = (containerWidth - padding * 2) / canvasWidth
    const scaleY = (containerHeight - padding * 2) / canvasHeight
    const zoom = Math.min(scaleX, scaleY, 1)
    set({ zoom, panX: 0, panY: 0 })
  },

  actualSize: () => {
    set({ zoom: 1, panX: 0, panY: 0 })
  },

  setPan: (x: number, y: number) => {
    set({ panX: x, panY: y })
  },

  addPan: (dx: number, dy: number) => {
    set((state) => ({
      panX: state.panX + dx,
      panY: state.panY + dy,
    }))
  },

  resetPan: () => {
    set({ panX: 0, panY: 0 })
  },

  addGuide: (orientation, position) => {
    const newGuide: Guide = {
      id: crypto.randomUUID(),
      orientation,
      position,
    }
    set((state) => ({
      guides: [...state.guides, newGuide],
    }))
  },

  removeGuide: (id: string) => {
    set((state) => ({
      guides: state.guides.filter((g) => g.id !== id),
    }))
  },

  moveGuide: (id: string, position: number) => {
    set((state) => ({
      guides: state.guides.map((g) =>
        g.id === id ? { ...g, position } : g
      ),
    }))
  },

  clearGuides: () => {
    set({ guides: [] })
  },

  toggleRulers: () => {
    set((state) => ({ showRulers: !state.showRulers }))
  },

  toggleGuides: () => {
    set((state) => ({ showGuides: !state.showGuides }))
  },

  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }))
  },

  setGridSize: (size: number) => {
    set({ gridSize: Math.max(1, size) })
  },

  toggleSnapToGuides: () => {
    set((state) => ({ snapToGuides: !state.snapToGuides }))
  },

  toggleSnapToGrid: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }))
  },
}))
