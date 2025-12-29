import type { ToolType } from '@/types'

export interface ToolContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  layerId: string
  primaryColor: string
  secondaryColor: string
}

export interface ToolEvent {
  x: number
  y: number
  pressure: number
  button: number
  shiftKey: boolean
  ctrlKey: boolean
  altKey: boolean
}

export abstract class BaseTool {
  abstract readonly type: ToolType
  abstract readonly name: string
  abstract readonly cursor: string

  protected isDrawing = false
  protected lastX = 0
  protected lastY = 0

  abstract onMouseDown(ctx: ToolContext, event: ToolEvent): void
  abstract onMouseMove(ctx: ToolContext, event: ToolEvent): void
  abstract onMouseUp(ctx: ToolContext, event: ToolEvent): void

  onActivate(): void {}
  onDeactivate(): void {}

  protected getCanvasCoordinates(
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number,
    zoom: number,
    panX: number,
    panY: number
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const x = (clientX - rect.left - centerX - panX) / zoom + canvas.width / 2
    const y = (clientY - rect.top - centerY - panY) / zoom + canvas.height / 2

    return { x, y }
  }
}
