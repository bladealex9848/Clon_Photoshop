'use client'

import { useState } from 'react'
import { MenuBar } from './MenuBar'

export function TopBar() {
  return (
    <div className="h-12 bg-editor-surface border-b border-editor-border flex items-center px-2">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 mr-4">
        <span className="material-symbols-outlined text-editor-accent text-xl">layers</span>
        <span className="text-sm font-semibold text-editor-text-bright">PhotoClone</span>
      </div>

      {/* Menu Bar */}
      <MenuBar />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Zoom indicator */}
        <div className="text-xs text-editor-text-muted px-2">100%</div>

        {/* Export Button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-editor-accent text-white text-sm rounded hover:bg-editor-accent-hover transition-colors">
          <span className="material-symbols-outlined text-base">download</span>
          Exportar
        </button>
      </div>
    </div>
  )
}
