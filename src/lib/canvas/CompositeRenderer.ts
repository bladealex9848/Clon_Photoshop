import type { Layer } from '@/types'
import { BLEND_MODE_COMPOSITE } from '@/constants'
import { LayerEngine } from './LayerEngine'

export class CompositeRenderer {
  private engine: LayerEngine
  private outputCanvas: HTMLCanvasElement
  private outputCtx: CanvasRenderingContext2D

  constructor(outputCanvas: HTMLCanvasElement, width: number, height: number) {
    this.outputCanvas = outputCanvas
    this.outputCtx = outputCanvas.getContext('2d')!
    this.engine = new LayerEngine(width, height)

    outputCanvas.width = width
    outputCanvas.height = height
  }

  get layerEngine(): LayerEngine {
    return this.engine
  }

  resize(width: number, height: number) {
    this.outputCanvas.width = width
    this.outputCanvas.height = height
    this.engine.resize(width, height)
  }

  render(layers: Layer[], layerOrder: string[]) {
    const ctx = this.outputCtx

    // Clear output
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, this.outputCanvas.width, this.outputCanvas.height)

    // Render layers in order (bottom to top = end to start of array)
    for (let i = layerOrder.length - 1; i >= 0; i--) {
      const layerId = layerOrder[i]
      const layer = layers.find((l) => l.id === layerId)

      if (!layer || !layer.visible || layer.type === 'group') continue

      const layerCanvas = this.engine.getLayerCanvas(layerId)

      // Save context state
      ctx.save()

      // Apply opacity
      ctx.globalAlpha = layer.opacity / 100

      // Apply blend mode
      ctx.globalCompositeOperation = BLEND_MODE_COMPOSITE[layer.blendMode]

      // Apply transform
      const { x, y, scaleX, scaleY, rotation } = layer.transform
      const centerX = this.outputCanvas.width / 2
      const centerY = this.outputCanvas.height / 2

      ctx.translate(centerX + x, centerY + y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scaleX, scaleY)
      ctx.translate(-centerX, -centerY)

      // Draw layer
      ctx.drawImage(layerCanvas, 0, 0)

      // Restore context state
      ctx.restore()
    }
  }

  renderSingleLayer(layer: Layer): ImageData | null {
    const canvas = this.engine.getLayerCanvas(layer.id)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      return ctx.getImageData(0, 0, this.outputCanvas.width, this.outputCanvas.height)
    }
    return null
  }

  getOutputCanvas(): HTMLCanvasElement {
    return this.outputCanvas
  }

  getOutputContext(): CanvasRenderingContext2D {
    return this.outputCtx
  }

  toDataURL(type = 'image/png', quality = 1): string {
    return this.outputCanvas.toDataURL(type, quality)
  }

  toBlob(type = 'image/png', quality = 1): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.outputCanvas.toBlob(resolve, type, quality)
    })
  }

  dispose() {
    this.engine.dispose()
  }
}
