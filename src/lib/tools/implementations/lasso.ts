import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType } from '@/types'

export class LassoTool extends BaseTool {
  readonly type: ToolType = 'lasso'
  readonly name = 'Lazo'
  readonly cursor = 'crosshair'

  private points: { x: number; y: number }[] = []
  private onSelectionPath?: (path: { x: number; y: number }[]) => void

  setOnSelectionPath(callback: (path: { x: number; y: number }[]) => void) {
    this.onSelectionPath = callback
  }

  onMouseDown(_ctx: ToolContext, event: ToolEvent): void {
    this.isDrawing = true
    this.points = [{ x: event.x, y: event.y }]
  }

  onMouseMove(_ctx: ToolContext, event: ToolEvent): void {
    if (!this.isDrawing) return

    this.points.push({ x: event.x, y: event.y })

    if (this.onSelectionPath) {
      this.onSelectionPath([...this.points])
    }
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    if (this.isDrawing && this.points.length > 2) {
      // Close the path
      this.points.push(this.points[0])

      if (this.onSelectionPath) {
        this.onSelectionPath([...this.points])
      }
    }
    this.isDrawing = false
    this.points = []
  }

  drawLassoPath(
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[]
  ): void {
    if (points.length < 2) return

    ctx.save()

    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }

    ctx.stroke()
    ctx.restore()
  }
}

export const lassoTool = new LassoTool()
