export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'

export interface LayerTransform {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number // degrees
}

export interface Layer {
  id: string
  name: string
  type: 'raster' | 'text' | 'group'
  visible: boolean
  locked: boolean
  opacity: number // 0-100
  blendMode: BlendMode
  transform: LayerTransform

  // For raster layers
  imageData?: ImageData
  imageUrl?: string // URL for remote or blob images
  thumbnail?: string // URL for thumbnail preview

  // For text layers
  textContent?: string
  fontSize?: number
  fontFamily?: string
  fontColor?: string

  // For groups
  children?: string[]
  isExpanded?: boolean
  parentId?: string | null

  // Metadata
  createdAt: number
  modifiedAt: number
}

export interface LayerGroup extends Layer {
  type: 'group'
  children: string[]
  isExpanded: boolean
}

export const DEFAULT_LAYER_TRANSFORM: LayerTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
}

export function createLayer(partial: Partial<Layer>): Layer {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name: 'Nueva Capa',
    type: 'raster',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    transform: { ...DEFAULT_LAYER_TRANSFORM },
    parentId: null,
    createdAt: now,
    modifiedAt: now,
    ...partial,
  }
}

export function createGroup(partial: Partial<LayerGroup>): LayerGroup {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name: 'Nuevo Grupo',
    type: 'group',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    transform: { ...DEFAULT_LAYER_TRANSFORM },
    children: [],
    isExpanded: true,
    parentId: null,
    createdAt: now,
    modifiedAt: now,
    ...partial,
  }
}
