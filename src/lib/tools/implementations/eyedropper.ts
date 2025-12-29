import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType } from '@/types'

export class EyedropperTool extends BaseTool {
  readonly type: ToolType = 'eyedropper'
  readonly name = 'Cuentagotas'
  readonly cursor = 'crosshair'

  private onColorPick?: (color: string) => void

  setOnColorPick(callback: (color: string) => void) {
    this.onColorPick = callback
  }

  onMouseDown(ctx: ToolContext, event: ToolEvent): void {
    this.pickColor(ctx, event)
  }

  onMouseMove(ctx: ToolContext, event: ToolEvent): void {
    if (this.isDrawing) {
      this.pickColor(ctx, event)
    }
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    this.isDrawing = false
  }

  private pickColor(ctx: ToolContext, event: ToolEvent): void {
    const x = Math.floor(event.x)
    const y = Math.floor(event.y)

    if (x < 0 || x >= ctx.canvas.width || y < 0 || y >= ctx.canvas.height) {
      return
    }

    const imageData = ctx.ctx.getImageData(x, y, 1, 1)
    const [r, g, b] = imageData.data

    const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

    if (this.onColorPick) {
      this.onColorPick(color)
    }
  }
}

export const eyedropperTool = new EyedropperTool()
