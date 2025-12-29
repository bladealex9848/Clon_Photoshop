import type { Tool, ToolType } from '@/types'

export const TOOLS: Record<ToolType, Tool> = {
  move: { type: 'move', name: 'Mover', shortcut: 'V', icon: 'open_with', cursor: 'move' },
  selection: { type: 'selection', name: 'Selección', shortcut: 'M', icon: 'select_all', cursor: 'crosshair' },
  lasso: { type: 'lasso', name: 'Lazo', shortcut: 'L', icon: 'lasso_select', cursor: 'crosshair' },
  brush: { type: 'brush', name: 'Pincel', shortcut: 'B', icon: 'brush', cursor: 'crosshair' },
  eraser: { type: 'eraser', name: 'Borrador', shortcut: 'E', icon: 'ink_eraser', cursor: 'crosshair' },
  text: { type: 'text', name: 'Texto', shortcut: 'T', icon: 'text_fields', cursor: 'text' },
  crop: { type: 'crop', name: 'Recortar', shortcut: 'C', icon: 'crop', cursor: 'crosshair' },
  eyedropper: { type: 'eyedropper', name: 'Cuentagotas', shortcut: 'I', icon: 'colorize', cursor: 'crosshair' },
  zoom: { type: 'zoom', name: 'Zoom', shortcut: 'Z', icon: 'zoom_in', cursor: 'zoom-in' },
  hand: { type: 'hand', name: 'Mano', shortcut: 'H', icon: 'pan_tool', cursor: 'grab' },
}

export const TOOL_ORDER: ToolType[] = [
  'move',
  'selection',
  'lasso',
  'brush',
  'eraser',
  'text',
  'crop',
  'eyedropper',
  'zoom',
  'hand',
]
