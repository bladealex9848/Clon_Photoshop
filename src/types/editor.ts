export interface Document {
  id: string
  name: string
  width: number
  height: number
  backgroundColor: string
  colorMode: 'rgb' | 'grayscale'
  createdAt: number
  modifiedAt: number
}

export interface EditorState {
  document: Document | null
  isDirty: boolean
  isLoading: boolean
  error: string | null
}

export interface ViewState {
  zoom: number
  panX: number
  panY: number
  showRulers: boolean
  showGuides: boolean
  showGrid: boolean
  gridSize: number
  snapToGuides: boolean
  snapToGrid: boolean
}

export interface Guide {
  id: string
  orientation: 'horizontal' | 'vertical'
  position: number
}

export function createDocument(partial: Partial<Document>): Document {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name: 'Sin título',
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff',
    colorMode: 'rgb',
    createdAt: now,
    modifiedAt: now,
    ...partial,
  }
}
