import type { Layer } from './layer'

export interface HistoryAction {
  id: string
  type: string
  name: string
  timestamp: number
  layerSnapshots: Record<string, Layer>
  layerOrder: string[]
  activeLayerId: string | null
}

export interface HistoryState {
  actions: HistoryAction[]
  currentIndex: number
  maxHistory: number
}

export function createHistoryAction(
  type: string,
  name: string,
  layers: Record<string, Layer>,
  layerOrder: string[],
  activeLayerId: string | null
): HistoryAction {
  return {
    id: crypto.randomUUID(),
    type,
    name,
    timestamp: Date.now(),
    layerSnapshots: JSON.parse(JSON.stringify(layers)),
    layerOrder: [...layerOrder],
    activeLayerId,
  }
}
