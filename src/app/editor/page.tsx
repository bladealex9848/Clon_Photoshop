'use client'

import { TopBar } from '@/components/editor/TopBar/TopBar'
import { Toolbar } from '@/components/editor/Toolbar/Toolbar'
import { CanvasContainer } from '@/components/editor/Canvas/CanvasContainer'
import { RightPanel } from '@/components/editor/RightPanel/RightPanel'
import { useKeyboardShortcuts } from '@/hooks'
import { useEffect } from 'react'
import { initHistory } from '@/lib/history'

export default function EditorPage() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  // Initialize history recording (layer-structure snapshots)
  useEffect(() => { initHistory() }, [])

  return (
    <div className="editor-shell flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <Toolbar />

        {/* Canvas Area */}
        <CanvasContainer />

        {/* Right Panel */}
        <RightPanel />
      </div>
    </div>
  )
}
