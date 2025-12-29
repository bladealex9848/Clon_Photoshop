import { create } from 'zustand'
import type { HistoryAction, Layer } from '@/types'
import { createHistoryAction } from '@/types'
import { MAX_HISTORY } from '@/constants'

interface HistoryState {
  actions: HistoryAction[]
  currentIndex: number
  maxHistory: number

  // Actions
  pushAction: (type: string, name: string, layers: Record<string, Layer>, layerOrder: string[], activeLayerId: string | null) => void
  undo: () => HistoryAction | null
  redo: () => HistoryAction | null
  jumpToAction: (index: number) => HistoryAction | null
  clearHistory: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  getCurrentAction: () => HistoryAction | null
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  actions: [],
  currentIndex: -1,
  maxHistory: MAX_HISTORY,

  pushAction: (type, name, layers, layerOrder, activeLayerId) => {
    const action = createHistoryAction(type, name, layers, layerOrder, activeLayerId)

    set((state) => {
      // Remove any actions after current index (invalidate redo stack)
      const newActions = state.actions.slice(0, state.currentIndex + 1)

      // Add new action
      newActions.push(action)

      // Trim to max history
      while (newActions.length > state.maxHistory) {
        newActions.shift()
      }

      return {
        actions: newActions,
        currentIndex: newActions.length - 1,
      }
    })
  },

  undo: () => {
    const state = get()
    if (!state.canUndo()) return null

    const newIndex = state.currentIndex - 1
    set({ currentIndex: newIndex })
    return state.actions[newIndex] || null
  },

  redo: () => {
    const state = get()
    if (!state.canRedo()) return null

    const newIndex = state.currentIndex + 1
    set({ currentIndex: newIndex })
    return state.actions[newIndex]
  },

  jumpToAction: (index: number) => {
    const state = get()
    if (index < 0 || index >= state.actions.length) return null

    set({ currentIndex: index })
    return state.actions[index]
  },

  clearHistory: () => {
    set({ actions: [], currentIndex: -1 })
  },

  canUndo: () => {
    const state = get()
    return state.currentIndex > 0
  },

  canRedo: () => {
    const state = get()
    return state.currentIndex < state.actions.length - 1
  },

  getCurrentAction: () => {
    const state = get()
    return state.actions[state.currentIndex] || null
  },
}))
