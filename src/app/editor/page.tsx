'use client'

import { TopBar } from '@/components/editor/TopBar/TopBar'
import { Toolbar } from '@/components/editor/Toolbar/Toolbar'
import { CanvasContainer } from '@/components/editor/Canvas/CanvasContainer'
import { RightPanel } from '@/components/editor/RightPanel/RightPanel'
import { useKeyboardShortcuts } from '@/hooks'

export default function EditorPage() {
  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  return (
    <div className="flex flex-col h-full">
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
