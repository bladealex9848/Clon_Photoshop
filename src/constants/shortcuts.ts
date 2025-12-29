export const KEYBOARD_SHORTCUTS = {
  // Tools
  'v': 'move',
  'm': 'selection',
  'l': 'lasso',
  'b': 'brush',
  'e': 'eraser',
  't': 'text',
  'c': 'crop',
  'i': 'eyedropper',
  'z': 'zoom',
  'h': 'hand',
  ' ': 'hand_temp', // Space for temporary pan

  // Actions
  'ctrl+z': 'undo',
  'meta+z': 'undo',
  'ctrl+shift+z': 'redo',
  'meta+shift+z': 'redo',
  'ctrl+y': 'redo',
  'meta+y': 'redo',
  'ctrl+s': 'export',
  'meta+s': 'export',
  'ctrl+a': 'select_all',
  'meta+a': 'select_all',
  'ctrl+d': 'deselect',
  'meta+d': 'deselect',
  'delete': 'delete_selection',
  'backspace': 'delete_selection',
  'escape': 'cancel',

  // View
  'ctrl+=': 'zoom_in',
  'meta+=': 'zoom_in',
  'ctrl+-': 'zoom_out',
  'meta+-': 'zoom_out',
  'ctrl+0': 'fit_screen',
  'meta+0': 'fit_screen',
  'ctrl+1': 'actual_size',
  'meta+1': 'actual_size',

  // Layers
  'ctrl+shift+n': 'new_layer',
  'meta+shift+n': 'new_layer',
  'ctrl+j': 'duplicate_layer',
  'meta+j': 'duplicate_layer',
  'ctrl+g': 'group_layers',
  'meta+g': 'group_layers',
  'ctrl+shift+g': 'ungroup_layers',
  'meta+shift+g': 'ungroup_layers',
  'ctrl+e': 'merge_down',
  'meta+e': 'merge_down',
} as const

export type ShortcutAction = (typeof KEYBOARD_SHORTCUTS)[keyof typeof KEYBOARD_SHORTCUTS]
