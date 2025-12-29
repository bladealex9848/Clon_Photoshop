'use client'

import { useEffect, useCallback } from 'react'
import { useToolStore, useHistoryStore, useViewStore } from '@/stores'
import type { ToolType } from '@/types'

const TOOL_SHORTCUTS: Record<string, ToolType> = {
  v: 'move',
  m: 'selection',
  l: 'lasso',
  b: 'brush',
  e: 'eraser',
  t: 'text',
  c: 'crop',
  i: 'eyedropper',
  z: 'zoom',
  h: 'hand',
}

export function useKeyboardShortcuts() {
  const { setTool, setTemporaryTool, restorePreviousTool, swapColors } = useToolStore()
  const { undo, redo, canUndo, canRedo } = useHistoryStore()
  const { zoomIn, zoomOut, actualSize, toggleRulers, toggleGrid } = useViewStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // Tool shortcuts
      if (!ctrl && !shift && TOOL_SHORTCUTS[key]) {
        e.preventDefault()
        setTool(TOOL_SHORTCUTS[key])
        return
      }

      // Space for temporary hand tool
      if (key === ' ' && !ctrl) {
        e.preventDefault()
        setTemporaryTool('hand')
        return
      }

      // Color swap
      if (key === 'x' && !ctrl) {
        e.preventDefault()
        swapColors()
        return
      }

      // Undo/Redo
      if (ctrl && key === 'z' && !shift) {
        e.preventDefault()
        if (canUndo()) undo()
        return
      }

      if (ctrl && key === 'z' && shift) {
        e.preventDefault()
        if (canRedo()) redo()
        return
      }

      if (ctrl && key === 'y') {
        e.preventDefault()
        if (canRedo()) redo()
        return
      }

      // Zoom
      if (ctrl && (key === '=' || key === '+')) {
        e.preventDefault()
        zoomIn()
        return
      }

      if (ctrl && key === '-') {
        e.preventDefault()
        zoomOut()
        return
      }

      if (ctrl && key === '1') {
        e.preventDefault()
        actualSize()
        return
      }

      // Toggle rulers
      if (ctrl && key === 'r') {
        e.preventDefault()
        toggleRulers()
        return
      }

      // Toggle grid
      if (ctrl && key === "'") {
        e.preventDefault()
        toggleGrid()
        return
      }
    },
    [setTool, setTemporaryTool, swapColors, undo, redo, canUndo, canRedo, zoomIn, zoomOut, actualSize, toggleRulers, toggleGrid]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ') {
        restorePreviousTool()
      }
    },
    [restorePreviousTool]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])
}
