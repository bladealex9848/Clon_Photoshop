import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType, BrushConfig } from '@/types'

export class BrushTool extends BaseTool {
  readonly type: ToolType = 'brush'
  readonly name = 'Pincel'
  readonly cursor = 'crosshair'

  private config: BrushConfig = {
    size: 20,
    hardness: 100,
    opacity: 100,
    color: '#000000',
    flow: 100,
  }

  setConfig(config: Partial<BrushConfig>) {
    this.config = { ...this.config, ...config }
  }

  onMouseDown(ctx: ToolContext, event: ToolEvent): void {
    this.isDrawing = true
    this.lastX = event.x
    this.lastY = event.y

    // Draw initial dot
    this.drawBrushStroke(ctx.ctx, event.x, event.y, event.x, event.y)
  }

  onMouseMove(ctx: ToolContext, event: ToolEvent): void {
    if (!this.isDrawing) return

    this.drawBrushStroke(ctx.ctx, this.lastX, this.lastY, event.x, event.y)

    this.lastX = event.x
    this.lastY = event.y
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    this.isDrawing = false
  }

  private drawBrushStroke(
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): void {
    ctx.save()

    ctx.globalAlpha = this.config.opacity / 100
    ctx.strokeStyle = this.config.color
    ctx.fillStyle = this.config.color
    ctx.lineWidth = this.config.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Apply hardness (blur effect for soft brushes)
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

export const brushTool = new BrushTool()
