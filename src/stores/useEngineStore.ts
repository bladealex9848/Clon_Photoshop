import { create } from 'zustand'
import type { CompositeRenderer } from '@/lib/canvas/CompositeRenderer'
import { useLayerStore } from './useLayerStore'

/**
 * Puente entre la UI (menús/paneles) y el motor de canvas que vive en
 * refs dentro de CanvasContainer. CanvasContainer registra el compositor;
 * los menús/paneles operan sobre los píxeles de la capa activa a través
 * de aquí y disparan recomposición + refresco de miniatura.
 */
interface EngineState {
  compositor: CompositeRenderer | null
  register: (c: CompositeRenderer | null) => void

  /** Ejecuta una transformación de píxeles sobre la capa indicada. */
  runOnLayer: (
    layerId: string,
    fn: (ctx: OffscreenCanvasRenderingContext2D, w: number, h: number) => void
  ) => boolean

  /** Regenera la miniatura de una capa desde su canvas offscreen y recompone. */
  refreshLayer: (layerId: string) => void

  /** Devuelve el ImageData completo de una capa (o null). */
  snapshot: (layerId: string) => ImageData | null
}

function thumbDataUrl(canvas: OffscreenCanvas): string | undefined {
  try {
    const tw = 80
    const th = Math.max(1, Math.round((canvas.height / canvas.width) * tw))
    const off = new OffscreenCanvas(tw, th)
    const octx = off.getContext('2d')
    if (!octx) return undefined
    octx.drawImage(canvas, 0, 0, tw, th)
    // OffscreenCanvas no tiene toDataURL síncrono universal; usamos un
    // canvas HTML temporal para obtener el data URL.
    const tmp = document.createElement('canvas')
    tmp.width = tw
    tmp.height = th
    const tctx = tmp.getContext('2d')
    if (!tctx) return undefined
    tctx.drawImage(off, 0, 0)
    return tmp.toDataURL('image/png')
  } catch {
    return undefined
  }
}

export const useEngineStore = create<EngineState>((set, get) => ({
  compositor: null,

  register: (c) => set({ compositor: c }),

  runOnLayer: (layerId, fn) => {
    const compositor = get().compositor
    if (!compositor) return false
    const canvas = compositor.layerEngine.getLayerCanvas(layerId)
    const ctx = compositor.layerEngine.getLayerContext(layerId)
    if (!ctx) return false
    fn(ctx, canvas.width, canvas.height)
    get().refreshLayer(layerId)
    return true
  },

  refreshLayer: (layerId) => {
    const compositor = get().compositor
    if (!compositor) return
    const canvas = compositor.layerEngine.getLayerCanvas(layerId)
    const thumb = thumbDataUrl(canvas)
    // updateLayer cambia el objeto layers -> CanvasContainer recompone.
    useLayerStore.getState().updateLayer(layerId, thumb ? { thumbnail: thumb } : {})
  },

  snapshot: (layerId) => {
    const compositor = get().compositor
    if (!compositor) return null
    return compositor.layerEngine.getLayerImageData(layerId)
  },
}))
