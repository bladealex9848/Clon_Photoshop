import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType, SelectionConfig } from '@/types'

export class SelectionTool extends BaseTool {
  readonly type: ToolType = 'selection'
  readonly name = 'Selección'
  readonly cursor = 'crosshair'

  private config: SelectionConfig = {
    mode: 'rectangle',
    feather: 0,
    antiAlias: true,
  }

  private startX = 0
  private startY = 0
  private onSelectionChange?: (bounds: { x: number; y: number; width: number; height: number } | null) => void

  setConfig(config: Partial<SelectionConfig>) {
    this.config = { ...this.config, ...config }
  }

  setOnSelectionChange(callback: typeof this.onSelectionChange) {
    this.onSelectionChange = callback
  }

  onMouseDown(_ctx: ToolContext, event: ToolEvent): void {
    this.isDrawing = true
    this.startX = event.x
    this.startY = event.y
  }

  onMouseMove(_ctx: ToolContext, event: ToolEvent): void {
    if (!this.isDrawing) return

    const bounds = this.calculateBounds(event.x, event.y)
    if (this.onSelectionChange) {
      this.onSelectionChange(bounds)
    }
  }

  onMouseUp(_ctx: ToolContext, event: ToolEvent): void {
    if (this.isDrawing) {
      const bounds = this.calculateBounds(event.x, event.y)
      if (bounds.width > 2 && bounds.height > 2 && this.onSelectionChange) {
        this.onSelectionChange(bounds)
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

  drawSelection(
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number }
  ): void {
    ctx.save()

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])

    if (this.config.mode === 'rectangle') {
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
    } else if (this.config.mode === 'ellipse') {
      ctx.beginPath()
      ctx.ellipse(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        bounds.width / 2,
        bounds.height / 2,
        0,
        0,
        Math.PI * 2
      )
      ctx.stroke()
    }

    ctx.restore()
  }
}

export const selectionTool = new SelectionTool()
