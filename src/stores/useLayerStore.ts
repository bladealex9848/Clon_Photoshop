import { create } from 'zustand'
import type { Layer, BlendMode, LayerTransform } from '@/types'
import { DEFAULT_LAYER_TRANSFORM, createLayer, createGroup } from '@/types'

interface LayerState {
  layers: Record<string, Layer>
  layerOrder: string[] // IDs in render order (bottom to top)
  activeLayerId: string | null
  selectedLayerIds: string[]

  // Actions
  addLayer: (layer?: Partial<Layer>) => string
  removeLayer: (id: string) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  setActiveLayer: (id: string | null) => void
  selectLayers: (ids: string[], additive?: boolean) => void
  duplicateLayer: (id: string) => string | null
  toggleVisibility: (id: string) => void
  toggleLock: (id: string) => void
  setOpacity: (id: string, opacity: number) => void
  setBlendMode: (id: string, blendMode: BlendMode) => void
  groupLayers: (layerIds: string[], groupName?: string) => string
  ungroupLayers: (groupId: string) => void
  clearAll: () => void

  // Getters
  getLayer: (id: string) => Layer | undefined
  getActiveLayer: () => Layer | undefined
  getOrderedLayers: () => Layer[]
}

export const useLayerStore = create<LayerState>((set, get) => ({
  layers: {},
  layerOrder: [],
  activeLayerId: null,
  selectedLayerIds: [],

  addLayer: (partial = {}) => {
    const newLayer = createLayer(partial)
    set((state) => ({
      layers: { ...state.layers, [newLayer.id]: newLayer },
      layerOrder: [newLayer.id, ...state.layerOrder],
      activeLayerId: newLayer.id,
      selectedLayerIds: [newLayer.id],
    }))
    return newLayer.id
  },

  removeLayer: (id: string) => {
    const state = get()
    if (Object.keys(state.layers).length <= 1) return

    const { [id]: removed, ...restLayers } = state.layers
    const newOrder = state.layerOrder.filter((layerId) => layerId !== id)

    let newActiveId = state.activeLayerId
    if (state.activeLayerId === id) {
      const currentIndex = state.layerOrder.indexOf(id)
      newActiveId = newOrder[Math.min(currentIndex, newOrder.length - 1)] || null
    }

    set({
      layers: restLayers,
      layerOrder: newOrder,
      activeLayerId: newActiveId,
      selectedLayerIds: state.selectedLayerIds.filter((layerId) => layerId !== id),
    })
  },

  updateLayer: (id: string, updates: Partial<Layer>) => {
    set((state) => ({
      layers: {
        ...state.layers,
        [id]: {
          ...state.layers[id],
          ...updates,
          modifiedAt: Date.now(),
        },
      },
    }))
  },

  reorderLayers: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const newOrder = [...state.layerOrder]
      const [removed] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, removed)
      return { layerOrder: newOrder }
    })
  },

  setActiveLayer: (id: string | null) => {
    set({ activeLayerId: id, selectedLayerIds: id ? [id] : [] })
  },

  selectLayers: (ids: string[], additive = false) => {
    set((state) => ({
      selectedLayerIds: additive
        ? [...new Set([...state.selectedLayerIds, ...ids])]
        : ids,
      activeLayerId: ids[0] || state.activeLayerId,
    }))
  },

  duplicateLayer: (id: string) => {
    const state = get()
    const layer = state.layers[id]
    if (!layer) return null

    const duplicated = createLayer({
      ...layer,
      name: `${layer.name} copia`,
      imageData: layer.imageData ? new ImageData(
        new Uint8ClampedArray(layer.imageData.data),
        layer.imageData.width,
        layer.imageData.height
      ) : undefined,
    })

    const currentIndex = state.layerOrder.indexOf(id)
    set((prevState) => {
      const newOrder = [...prevState.layerOrder]
      newOrder.splice(currentIndex, 0, duplicated.id)
      return {
        layers: { ...prevState.layers, [duplicated.id]: duplicated },
        layerOrder: newOrder,
        activeLayerId: duplicated.id,
        selectedLayerIds: [duplicated.id],
      }
    })

    return duplicated.id
  },

  toggleVisibility: (id: string) => {
    const layer = get().layers[id]
    if (layer) {
      get().updateLayer(id, { visible: !layer.visible })
    }
  },

  toggleLock: (id: string) => {
    const layer = get().layers[id]
    if (layer) {
      get().updateLayer(id, { locked: !layer.locked })
    }
  },

  setOpacity: (id: string, opacity: number) => {
    get().updateLayer(id, { opacity: Math.max(0, Math.min(100, opacity)) })
  },

  setBlendMode: (id: string, blendMode: BlendMode) => {
    get().updateLayer(id, { blendMode })
  },

  groupLayers: (layerIds: string[], groupName = 'Grupo') => {
    const state = get()
    const group = createGroup({ name: groupName, children: layerIds })

    // Find the topmost layer position
    let topIndex = Infinity
    layerIds.forEach((id) => {
      const idx = state.layerOrder.indexOf(id)
      if (idx < topIndex) topIndex = idx
    })

    // Remove grouped layers from order and add group
    const newOrder = state.layerOrder.filter((id) => !layerIds.includes(id))
    newOrder.splice(topIndex, 0, group.id)

    // Update parent references
    const updatedLayers = { ...state.layers }
    layerIds.forEach((id) => {
      if (updatedLayers[id]) {
        updatedLayers[id] = { ...updatedLayers[id], parentId: group.id }
      }
    })

    set({
      layers: { ...updatedLayers, [group.id]: group },
      layerOrder: newOrder,
      activeLayerId: group.id,
      selectedLayerIds: [group.id],
    })

    return group.id
  },

  ungroupLayers: (groupId: string) => {
    const state = get()
    const group = state.layers[groupId]
    if (!group || group.type !== 'group' || !group.children) return

    const groupIndex = state.layerOrder.indexOf(groupId)
    const newOrder = [...state.layerOrder]
    newOrder.splice(groupIndex, 1, ...group.children)

    // Remove parent references
    const updatedLayers = { ...state.layers }
    group.children.forEach((id) => {
      if (updatedLayers[id]) {
        updatedLayers[id] = { ...updatedLayers[id], parentId: null }
      }
    })
    delete updatedLayers[groupId]

    set({
      layers: updatedLayers,
      layerOrder: newOrder,
      activeLayerId: group.children[0] || null,
      selectedLayerIds: group.children,
    })
  },

  clearAll: () => {
    set({
      layers: {},
      layerOrder: [],
      activeLayerId: null,
      selectedLayerIds: [],
    })
  },

  getLayer: (id: string) => get().layers[id],

  getActiveLayer: () => {
    const state = get()
    return state.activeLayerId ? state.layers[state.activeLayerId] : undefined
  },

  getOrderedLayers: () => {
    const state = get()
    return state.layerOrder.map((id) => state.layers[id]).filter(Boolean)
  },
}))
