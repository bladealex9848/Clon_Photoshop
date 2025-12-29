import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType } from '@/types'

export class CropTool extends BaseTool {
  readonly type: ToolType = 'crop'
  readonly name = 'Recortar'
  readonly cursor = 'crosshair'

  private startX = 0
  private startY = 0
  private onCropChange?: (bounds: { x: number; y: number; width: number; height: number } | null) => void

  setOnCropChange(callback: typeof this.onCropChange) {
    this.onCropChange = callback
  }

  onMouseDown(_ctx: ToolContext, event: ToolEvent): void {
    this.isDrawing = true
    this.startX = event.x
    this.startY = event.y
  }

  onMouseMove(_ctx: ToolContext, event: ToolEvent): void {
    if (!this.isDrawing) return

    const bounds = this.calculateBounds(event.x, event.y)
    if (this.onCropChange) {
      this.onCropChange(bounds)
    }
  }

  onMouseUp(_ctx: ToolContext, event: ToolEvent): void {
    if (this.isDrawing) {
      const bounds = this.calculateBounds(event.x, event.y)
      if (bounds.width > 10 && bounds.height > 10 && this.onCropChange) {
        this.onCropChange(bounds)
      }
    }
    this.isDrawing = false
  }

  private calculateBounds(currentX: number, currentY: number) {
    const x = Math.min(this.startX, currentX)
    const y = Math.min(this.startY, currentY)
    const width = Math.abs(currentX - this.startX)
    const height = Math.abs(currentY - this.startY)

    return { x, y, width, height }
  }

  drawCropOverlay(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    ctx.save()

    // Draw darkened areas outside crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

    // Top
    ctx.fillRect(0, 0, canvasWidth, bounds.y)
    // Bottom
    ctx.fillRect(0, bounds.y + bounds.height, canvasWidth, canvasHeight - bounds.y - bounds.height)
    // Left
    ctx.fillRect(0, bounds.y, bounds.x, bounds.height)
    // Right
    ctx.fillRect(bounds.x + bounds.width, bounds.y, canvasWidth - bounds.x - bounds.width, bounds.height)

    // Draw crop border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)

    // Draw rule of thirds guides
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 1

    const thirdW = bounds.width / 3
    const thirdH = bounds.height / 3

    ctx.beginPath()
    ctx.moveTo(bounds.x + thirdW, bounds.y)
    ctx.lineTo(bounds.x + thirdW, bounds.y + bounds.height)
    ctx.moveTo(bounds.x + thirdW * 2, bounds.y)
    ctx.lineTo(bounds.x + thirdW * 2, bounds.y + bounds.height)
    ctx.moveTo(bounds.x, bounds.y + thirdH)
    ctx.lineTo(bounds.x + bounds.width, bounds.y + thirdH)
    ctx.moveTo(bounds.x, bounds.y + thirdH * 2)
    ctx.lineTo(bounds.x + bounds.width, bounds.y + thirdH * 2)
    ctx.stroke()

    ctx.restore()
  }
}

export const cropTool = new CropTool()
