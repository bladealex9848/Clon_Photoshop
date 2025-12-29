export type SelectionType = 'rectangle' | 'ellipse' | 'lasso' | 'magic-wand' | 'all'

export interface SelectionBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface Selection {
  type: SelectionType
  path: Path2D | null
  bounds: SelectionBounds | null
  feather: number
  inverted: boolean
  antiAlias: boolean
}

export interface SelectionState {
  selection: Selection | null
  marching: boolean
}

export function createSelection(partial: Partial<Selection>): Selection {
  return {
    type: 'rectangle',
    path: null,
    bounds: null,
    feather: 0,
    inverted: false,
    antiAlias: true,
    ...partial,
  }
}
