'use client'

import { useState, useRef, useEffect } from 'react'
import { MenuBar } from './MenuBar'
import { useViewStore } from '@/stores/useViewStore'
import { useLayerStore } from '@/stores/useLayerStore'
import { useDocumentStore } from '@/stores/useDocumentStore'
import { PNGExporter } from '@/lib/export/PNGExporter'
import { ZIPExporter } from '@/lib/export/ZIPExporter'
import { ProjectExporter } from '@/lib/export/ProjectExporter'

export function TopBar() {
  const zoom = useViewStore((s) => s.zoom)
  const setZoom = useViewStore((s) => s.setZoom)
  const docName = useDocumentStore((s) => s.name)
  const docW = useDocumentStore((s) => s.width)
  const docH = useDocumentStore((s) => s.height)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const exportPNG = () => {
    const c = window.document.querySelector('canvas')
    if (c) PNGExporter.download(c, `${docName}.png`)
    setOpen(false)
  }
  const exportZIP = () => {
    const layers = useLayerStore.getState().getOrderedLayers()
    if (layers.length === 0) return
    const c = window.document.querySelector('canvas') as HTMLCanvasElement
    ZIPExporter.exportLayers(layers.map((l) => ({ id: l.id, name: l.name, canvas: c })), `${docName}_capas.zip`)
    setOpen(false)
  }
  const exportProject = async () => {
    const c = window.document.querySelector('canvas') as HTMLCanvasElement
    if (!c) return
    const ls = useLayerStore.getState()
    const layers = ls.getOrderedLayers()
    const map = new Map<string, HTMLCanvasElement>()
    layers.forEach((l) => map.set(l.id, c))
    await ProjectExporter.exportProject(
      { id: 'project-1', name: docName, width: docW, height: docH, backgroundColor: '#ffffff', colorMode: 'rgb' as const, createdAt: Date.now(), modifiedAt: Date.now() },
      layers, ls.layerOrder, map
    )
    setOpen(false)
  }

  return (
    <div className="h-12 bg-editor-surface border-b border-editor-border flex items-center px-2">
      <div className="flex items-center gap-2 px-3 mr-4">
        <span className="material-symbols-outlined text-editor-accent text-xl">layers</span>
        <span className="text-sm font-semibold text-editor-text-bright">PhotoClone</span>
      </div>

      <MenuBar />

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          className="text-xs text-editor-text-muted px-2 hover:text-editor-text"
          onClick={() => setZoom(1)}
          title="Restablecer zoom (100%)"
        >
          {Math.round(zoom * 100)}%
        </button>

        <div ref={ref} className="relative">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-editor-accent text-white text-sm rounded hover:bg-editor-accent-hover transition-colors"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="material-symbols-outlined text-base">download</span>
            Exportar
          </button>
          {open && (
            <div className="absolute top-full right-0 mt-1 min-w-52 bg-editor-surface border border-editor-border rounded-lg shadow-xl py-1 z-50">
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-editor-surface-hover" onClick={exportPNG}>Exportar PNG</button>
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-editor-surface-hover" onClick={exportZIP}>Exportar Capas (ZIP)</button>
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-editor-surface-hover" onClick={exportProject}>Guardar Proyecto (.photoclone)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
