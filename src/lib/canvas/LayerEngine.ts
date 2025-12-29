import type { Layer, BlendMode } from '@/types'
import { BLEND_MODE_COMPOSITE } from '@/constants'

export class LayerEngine {
  private canvasCache: Map<string, OffscreenCanvas> = new Map()
  private ctxCache: Map<string, OffscreenCanvasRenderingContext2D> = new Map()
  private width: number
  private height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    // Clear caches on resize
    this.canvasCache.clear()
    this.ctxCache.clear()
  }

  getLayerCanvas(layerId: string): OffscreenCanvas {
    let canvas = this.canvasCache.get(layerId)
    if (!canvas) {
      canvas = new OffscreenCanvas(this.width, this.height)
      this.canvasCache.set(layerId, canvas)
    }
    return canvas
  }

  getLayerContext(layerId: string): OffscreenCanvasRenderingContext2D | null {
    let ctx = this.ctxCache.get(layerId)
    if (!ctx) {
      const canvas = this.getLayerCanvas(layerId)
      ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D
      if (ctx) {
        this.ctxCache.set(layerId, ctx)
      }
    }
    return ctx
  }

  clearLayer(layerId: string) {
    const ctx = this.getLayerContext(layerId)
    if (ctx) {
      ctx.clearRect(0, 0, this.width, this.height)
    }
  }

  setLayerImageData(layerId: string, imageData: ImageData) {
    const ctx = this.getLayerContext(layerId)
    if (ctx) {
      ctx.putImageData(imageData, 0, 0)
    }
  }

  getLayerImageData(layerId: string): ImageData | null {
    const ctx = this.getLayerContext(layerId)
    if (ctx) {
      return ctx.getImageData(0, 0, this.width, this.height)
    }
    return null
  }

  async loadImageToLayer(layerId: string, imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const ctx = this.getLayerContext(layerId)
        if (ctx) {
          ctx.clearRect(0, 0, this.width, this.height)
          // Center the image
          const x = (this.width - img.width) / 2
          const y = (this.height - img.height) / 2
          ctx.drawImage(img, x, y)
          resolve(true)
        } else {
          resolve(false)
        }
      }
      img.onerror = () => resolve(false)
      img.src = imageUrl
    })
  }

  async loadBase64ToLayer(layerId: string, base64: string): Promise<boolean> {
    const dataUrl = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`
    return this.loadImageToLayer(layerId, dataUrl)
  }

  removeLayer(layerId: string) {
    this.canvasCache.delete(layerId)
    this.ctxCache.delete(layerId)
  }

  duplicateLayer(sourceId: string, targetId: string) {
    const sourceCtx = this.getLayerContext(sourceId)
    const targetCtx = this.getLayerContext(targetId)
    if (sourceCtx && targetCtx) {
      const imageData = sourceCtx.getImageData(0, 0, this.width, this.height)
      targetCtx.putImageData(imageData, 0, 0)
    }
  }

  dispose() {
    this.canvasCache.clear()
    this.ctxCache.clear()
  }
}
