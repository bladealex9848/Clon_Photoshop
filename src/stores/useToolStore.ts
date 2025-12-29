import { create } from 'zustand'
import type { ToolType, ToolConfig, BrushConfig, EraserConfig, TextConfig, SelectionConfig } from '@/types'
import { DEFAULT_BRUSH, DEFAULT_ERASER, DEFAULT_TEXT, DEFAULT_SELECTION } from '@/constants'

interface ToolState {
  activeTool: ToolType
  previousTool: ToolType | null
  config: ToolConfig
  primaryColor: string
  secondaryColor: string

  // Actions
  setTool: (tool: ToolType) => void
  setTemporaryTool: (tool: ToolType) => void
  restorePreviousTool: () => void
  updateBrushConfig: (updates: Partial<BrushConfig>) => void
  updateEraserConfig: (updates: Partial<EraserConfig>) => void
  updateTextConfig: (updates: Partial<TextConfig>) => void
  updateSelectionConfig: (updates: Partial<SelectionConfig>) => void
  setPrimaryColor: (color: string) => void
  setSecondaryColor: (color: string) => void
  swapColors: () => void
}

export const useToolStore = create<ToolState>((set, get) => ({
  activeTool: 'move',
  previousTool: null,
  config: {
    brush: { ...DEFAULT_BRUSH },
    eraser: { ...DEFAULT_ERASER },
    text: { ...DEFAULT_TEXT },
    selection: { ...DEFAULT_SELECTION },
    zoom: { mode: 'in' },
  },
  primaryColor: '#000000',
  secondaryColor: '#ffffff',

  setTool: (tool: ToolType) => {
    set({ activeTool: tool, previousTool: null })
  },

  setTemporaryTool: (tool: ToolType) => {
    const current = get().activeTool
    if (current !== tool) {
      set({ activeTool: tool, previousTool: current })
    }
  },

  restorePreviousTool: () => {
    const previous = get().previousTool
    if (previous) {
      set({ activeTool: previous, previousTool: null })
    }
  },

  updateBrushConfig: (updates: Partial<BrushConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        brush: { ...state.config.brush, ...updates },
      },
    }))
  },

  updateEraserConfig: (updates: Partial<EraserConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        eraser: { ...state.config.eraser, ...updates },
      },
    }))
  },

  updateTextConfig: (updates: Partial<TextConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        text: { ...state.config.text, ...updates },
      },
    }))
  },

  updateSelectionConfig: (updates: Partial<SelectionConfig>) => {
    set((state) => ({
      config: {
        ...state.config,
        selection: { ...state.config.selection, ...updates },
      },
    }))
  },

  setPrimaryColor: (color: string) => {
    set({ primaryColor: color })
    // Also update brush color
    get().updateBrushConfig({ color })
  },

  setSecondaryColor: (color: string) => {
    set({ secondaryColor: color })
  },

  swapColors: () => {
    const { primaryColor, secondaryColor } = get()
    set({ primaryColor: secondaryColor, secondaryColor: primaryColor })
    get().updateBrushConfig({ color: secondaryColor })
  },
}))
