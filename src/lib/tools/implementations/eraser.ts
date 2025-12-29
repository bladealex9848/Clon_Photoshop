import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType, EraserConfig } from '@/types'

export class EraserTool extends BaseTool {
  readonly type: ToolType = 'eraser'
  readonly name = 'Borrador'
  readonly cursor = 'crosshair'

  private config: EraserConfig = {
    size: 20,
    hardness: 100,
    opacity: 100,
  }

  setConfig(config: Partial<EraserConfig>) {
    this.config = { ...this.config, ...config }
  }

  onMouseDown(ctx: ToolContext, event: ToolEvent): void {
    this.isDrawing = true
    this.lastX = event.x
    this.lastY = event.y

    this.erase(ctx.ctx, event.x, event.y, event.x, event.y)
  }

  onMouseMove(ctx: ToolContext, event: ToolEvent): void {
    if (!this.isDrawing) return

    this.erase(ctx.ctx, this.lastX, this.lastY, event.x, event.y)

    this.lastX = event.x
    this.lastY = event.y
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    this.isDrawing = false
  }

  private erase(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): void {
    ctx.save()

    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = this.config.opacity / 100
    ctx.lineWidth = this.config.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (this.config.hardness < 100) {
      const blur = ((100 - this.config.hardness) / 100) * (this.config.size / 2)
      ctx.filter = `blur(${blur}px)`
    }

    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()

    ctx.restore()
  }
}

export const eraserTool = new EraserTool()
