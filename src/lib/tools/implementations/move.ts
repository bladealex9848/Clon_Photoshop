import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType } from '@/types'

export class MoveTool extends BaseTool {
  readonly type: ToolType = 'move'
  readonly name = 'Mover'
  readonly cursor = 'move'

  private startX = 0
  private startY = 0
  private initialTransformX = 0
  private initialTransformY = 0

  private onTransformChange?: (dx: number, dy: number) => void

  setOnTransformChange(callback: (dx: number, dy: number) => void) {
    this.onTransformChange = callback
  }

  onMouseDown(_ctx: ToolContext, event: ToolEvent): void {
    this.isDrawing = true
    this.startX = event.x
    this.startY = event.y
    this.initialTransformX = 0
    this.initialTransformY = 0
  }

  onMouseMove(_ctx: ToolContext, event: ToolEvent): void {
    if (!this.isDrawing) return

    const dx = event.x - this.startX
    const dy = event.y - this.startY

    if (this.onTransformChange) {
      this.onTransformChange(dx - this.initialTransformX, dy - this.initialTransformY)
    }

    this.initialTransformX = dx
    this.initialTransformY = dy
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    this.isDrawing = false
  }
}

export const moveTool = new MoveTool()
