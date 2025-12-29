import { BaseTool, ToolContext, ToolEvent } from '../BaseTool'
import type { ToolType, TextConfig } from '@/types'

export class TextTool extends BaseTool {
  readonly type: ToolType = 'text'
  readonly name = 'Texto'
  readonly cursor = 'text'

  private config: TextConfig = {
    fontSize: 24,
    fontFamily: 'Inter',
    color: '#000000',
    bold: false,
    italic: false,
  }

  private onTextInput?: (x: number, y: number, config: TextConfig) => void

  setConfig(config: Partial<TextConfig>) {
    this.config = { ...this.config, ...config }
  }

  setOnTextInput(callback: (x: number, y: number, config: TextConfig) => void) {
    this.onTextInput = callback
  }

  onMouseDown(_ctx: ToolContext, event: ToolEvent): void {
    if (this.onTextInput) {
      this.onTextInput(event.x, event.y, { ...this.config })
    }
  }

  onMouseMove(_ctx: ToolContext, _event: ToolEvent): void {
    // Text tool doesn't need mouse move handling
  }

  onMouseUp(_ctx: ToolContext, _event: ToolEvent): void {
    // Text tool doesn't need mouse up handling
  }

  drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
  ): void {
    ctx.save()

    const fontStyle = this.config.italic ? 'italic' : 'normal'
    const fontWeight = this.config.bold ? 'bold' : 'normal'
    ctx.font = `${fontStyle} ${fontWeight} ${this.config.fontSize}px ${this.config.fontFamily}`
    ctx.fillStyle = this.config.color
    ctx.textBaseline = 'top'

    ctx.fillText(text, x, y)

    ctx.restore()
  }
}

export const textTool = new TextTool()
