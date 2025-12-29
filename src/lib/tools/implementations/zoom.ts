import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType } from '@/types'

export class ZoomTool extends BaseTool {
  readonly type: ToolType = 'zoom'
  readonly name = 'Zoom'
  readonly cursor = 'zoom-in'

  private mode: 'in' | 'out' = 'in'
  private onZoom?: (zoomIn: boolean, x: number, y: number) => void

  setMode(mode: 'in' | 'out') {
    this.mode = mode
  }

  setOnZoom(callback: (zoomIn: boolean, x: number, y: number) => void) {
    this.onZoom = callback
  }

  onMouseDown(_ctx: ToolContext, event: ToolEvent): void {
    const zoomIn = event.altKey ? this.mode !== 'in' : this.mode === 'in'
    if (this.onZoom) {
      this.onZoom(zoomIn, event.x, event.y)
    }
  }

  onMouseMove(_ctx: ToolContext, _event: ToolEvent): void {
    // Zoom tool doesn't need mouse move handling
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    // Zoom tool doesn't need mouse up handling
  }
}

export const zoomTool = new ZoomTool()
