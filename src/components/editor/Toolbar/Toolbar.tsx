'use client'

import { useState } from 'react'
import { TOOLS, TOOL_ORDER } from '@/constants'
import type { ToolType } from '@/types'

export function Toolbar() {
  const [activeTool, setActiveTool] = useState<ToolType>('move')

  return (
    <div className="w-12 bg-editor-surface border-r border-editor-border flex flex-col items-center py-2">
      {TOOL_ORDER.map((toolType) => {
        const tool = TOOLS[toolType]
        return (
          <button
            key={toolType}
            className={`tool-btn ${activeTool === toolType ? 'active' : ''}`}
            onClick={() => setActiveTool(toolType)}
            title={`${tool.name} (${tool.shortcut})`}
          >
            <span className="material-symbols-outlined text-xl">{tool.icon}</span>
          </button>
        )
      })}

      {/* Divider */}
      <div className="w-8 h-px bg-editor-border my-3" />

      {/* Color Swatches */}
      <div className="relative w-10 h-10">
        {/* Background Color */}
        <div
          className="absolute bottom-0 right-0 w-6 h-6 rounded border border-editor-border cursor-pointer"
          style={{ backgroundColor: '#ffffff' }}
          title="Color de fondo"
        />
        {/* Foreground Color */}
        <div
          className="absolute top-0 left-0 w-6 h-6 rounded border border-editor-border cursor-pointer"
          style={{ backgroundColor: '#000000' }}
          title="Color de primer plano"
        />
        {/* Swap Icon */}
        <button
          className="absolute -top-1 -right-1 w-4 h-4 bg-editor-surface rounded-full flex items-center justify-center hover:bg-editor-surface-hover"
          title="Intercambiar colores (X)"
        >
          <span className="material-symbols-outlined text-xs">swap_horiz</span>
        </button>
      </div>
    </div>
  )
}
