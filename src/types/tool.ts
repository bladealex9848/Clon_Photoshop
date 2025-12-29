export type ToolType =
  | 'move'
  | 'selection'
  | 'lasso'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'crop'
  | 'eyedropper'
  | 'zoom'
  | 'hand'

export interface BrushConfig {
  size: number
  hardness: number
  opacity: number
  color: string
  flow: number
}

export interface EraserConfig {
  size: number
  hardness: number
  opacity: number
}

export interface TextConfig {
  fontSize: number
  fontFamily: string
  color: string
  bold: boolean
  italic: boolean
}

export interface SelectionConfig {
  mode: 'rectangle' | 'ellipse'
  feather: number
  antiAlias: boolean
}

export interface ZoomConfig {
  mode: 'in' | 'out'
}

export interface ToolConfig {
  brush: BrushConfig
  eraser: EraserConfig
  text: TextConfig
  selection: SelectionConfig
  zoom: ZoomConfig
}

export interface Tool {
  type: ToolType
  name: string
  shortcut: string
  icon: string
  cursor: string
}

export interface ToolState {
  activeTool: ToolType
  previousTool: ToolType | null
  config: ToolConfig
  primaryColor: string
  secondaryColor: string
}
