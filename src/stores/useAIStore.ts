import { create } from 'zustand'
import type { AIState, AIDecomposeResponse, AILayer } from '@/types'

interface AIStoreState extends AIState {
  // Actions
  setLayerCount: (count: number) => void
  setInstructions: (text: string) => void
  toggleInfiniteDecomposition: () => void
  setProcessing: (processing: boolean) => void
  setProgress: (progress: number) => void
  setError: (error: string | null) => void
  setLastResult: (result: AIDecomposeResponse | null) => void
  reset: () => void

  // API call
  decomposeImage: (imageBase64: string) => Promise<AIDecomposeResponse>
}

const initialState: AIState = {
  layerCount: 4,
  instructions: '',
  infiniteDecomposition: false,
  isProcessing: false,
  progress: 0,
  error: null,
  lastResult: null,
}

export const useAIStore = create<AIStoreState>((set, get) => ({
  ...initialState,

  setLayerCount: (count: number) => {
    set({ layerCount: Math.max(2, Math.min(10, count)) })
  },

  setInstructions: (text: string) => {
    set({ instructions: text })
  },

  toggleInfiniteDecomposition: () => {
    set((state) => ({ infiniteDecomposition: !state.infiniteDecomposition }))
  },

  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing })
  },

  setProgress: (progress: number) => {
    set({ progress: Math.max(0, Math.min(100, progress)) })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  setLastResult: (result: AIDecomposeResponse | null) => {
    set({ lastResult: result })
  },

  reset: () => {
    set(initialState)
  },

  decomposeImage: async (imageBase64: string): Promise<AIDecomposeResponse> => {
    const state = get()

    set({ isProcessing: true, progress: 0, error: null })

    try {
      const response = await fetch('/api/layers/decompose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          layerCount: state.layerCount,
          instructions: state.instructions || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      const result: AIDecomposeResponse = await response.json()

      set({ lastResult: result, isProcessing: false, progress: 100 })
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      set({ error: errorMessage, isProcessing: false })
      return { success: false, error: errorMessage }
    }
  },
}))
