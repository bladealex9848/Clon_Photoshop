import type { BrushConfig, EraserConfig, TextConfig, SelectionConfig, Document, ViewState } from '@/types'

export const DEFAULT_BRUSH: BrushConfig = {
  size: 20,
  hardness: 100,
  opacity: 100,
  color: '#000000',
  flow: 100,
}

export const DEFAULT_ERASER: EraserConfig = {
  size: 20,
  hardness: 100,
  opacity: 100,
}

export const DEFAULT_TEXT: TextConfig = {
  fontSize: 24,
  fontFamily: 'Inter',
  color: '#000000',
  bold: false,
  italic: false,
}

export const DEFAULT_SELECTION: SelectionConfig = {
  mode: 'rectangle',
  feather: 0,
  antiAlias: true,
}

export const DEFAULT_DOCUMENT: Omit<Document, 'id' | 'createdAt' | 'modifiedAt'> = {
  name: 'Sin título',
  width: 1920,
  height: 1080,
  backgroundColor: '#ffffff',
  colorMode: 'rgb',
}

export const DEFAULT_VIEW: ViewState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  showRulers: true,
  showGuides: true,
  showGrid: false,
  gridSize: 10,
  snapToGuides: true,
  snapToGrid: false,
}

export const DEFAULT_ZOOM = 1
export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 32
export const ZOOM_STEP = 0.25

export const MAX_HISTORY = 50

export const CANVAS_PADDING = 100
