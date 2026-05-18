import { create } from 'zustand'

/**
 * Selección rectangular a nivel de documento. Las operaciones de filtro y
 * borrado la respetan si está activa; si no, operan sobre toda la capa.
 * (Modelo bbox, no máscara freeform — documentado como tal.)
 */
export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

interface SelectionState {
  rect: SelectionRect | null
  feather: number
  setRect: (rect: SelectionRect | null) => void
  selectAll: (w: number, h: number) => void
  deselect: () => void
  invert: (w: number, h: number) => void
  setFeather: (px: number) => void
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  rect: null,
  feather: 0,

  setRect: (rect) => set({ rect }),

  selectAll: (w, h) => set({ rect: { x: 0, y: 0, width: w, height: h } }),

  deselect: () => set({ rect: null }),

  // Invertir un bbox no tiene representación bbox exacta; alternamos
  // entre la selección y "todo" como aproximación funcional documentada.
  invert: (w, h) => {
    const cur = get().rect
    if (!cur || (cur.x === 0 && cur.y === 0 && cur.width === w && cur.height === h)) {
      set({ rect: null })
    } else {
      set({ rect: { x: 0, y: 0, width: w, height: h } })
    }
  },

  setFeather: (px) => set({ feather: Math.max(0, Math.round(px)) }),
}))
