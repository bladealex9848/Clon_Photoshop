import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType } from '@/types'

export class HandTool extends BaseTool {
  readonly type: ToolType = 'hand'
  readonly name = 'Mano'
  readonly cursor = 'grab'

  private onPan?: (dx: number, dy: number) => void

  setOnPan(callback: (dx: number, dy: number) => void) {
    this.onPan = callback
  }

  onMouseDown(_ctx: ToolContext, event: ToolEvent): void {
    this.isDrawing = true
    this.lastX = event.x
    this.lastY = event.y
  }

  onMouseMove(_ctx: ToolContext, event: ToolEvent): void {
    if (!this.isDrawing) return

    const dx = event.x - this.lastX
    const dy = event.y - this.lastY

    if (this.onPan) {
      this.onPan(dx, dy)
    }

    this.lastX = event.x
    this.lastY = event.y
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    this.isDrawing = false
  }
}

export const handTool = new HandTool()
