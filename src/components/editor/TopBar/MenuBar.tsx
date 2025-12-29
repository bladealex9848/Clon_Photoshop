'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useLayerStore } from '@/stores/useLayerStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { useViewStore } from '@/stores/useViewStore'
import { PNGExporter } from '@/lib/export/PNGExporter'
import { ZIPExporter } from '@/lib/export/ZIPExporter'
import { ProjectExporter } from '@/lib/export/ProjectExporter'

interface MenuItem {
  label: string
  shortcut?: string
  action?: () => void
  divider?: boolean
  disabled?: boolean
}

interface Menu {
  label: string
  items: MenuItem[]
}

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stores
  const { getOrderedLayers, layerOrder, addLayer, setActiveLayer } = useLayerStore()
  const { undo, redo, canUndo, canRedo } = useHistoryStore()
  const { zoom, setZoom, actualSize } = useViewStore()

  const layers = getOrderedLayers()
  const projectName = 'Proyecto sin titulo'

  // File handlers
  const handleNewDocument = useCallback(() => {
    // Could show a modal for dimensions
    window.location.reload()
  }, [])

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a project file
    if (file.name.endsWith('.photoclone')) {
      const result = await ProjectExporter.importProject(file)
      if (result) {
        // TODO: Restore project state
        console.log('Proyecto importado:', result)
      }
      return
    }

    // Check if it's an image
    if (file.type.startsWith('image/')) {
      const img = new Image()
      img.onload = () => {
        // Create a new layer with this image
        const layerId = `layer-${Date.now()}`
        addLayer({
          id: layerId,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'raster',
          visible: true,
          locked: false,
          opacity: 100,
          blendMode: 'normal',
          transform: {
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
        })
        setActiveLayer(layerId)
      }
      img.src = URL.createObjectURL(file)
    }

    // Reset input
    e.target.value = ''
  }, [addLayer, setActiveLayer])

  const handleExportPNG = useCallback(() => {
    const canvas = window.document.querySelector('canvas')
    if (canvas) {
      PNGExporter.download(canvas, `${projectName}.png`)
    }
  }, [projectName])

  const handleExportLayersZIP = useCallback(() => {
    if (layers.length === 0) return

    // Get layer canvases from DOM (simplified approach)
    const layerData = layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      canvas: window.document.querySelector('canvas') as HTMLCanvasElement,
    }))

    ZIPExporter.exportLayers(layerData, `${projectName}_capas.zip`)
  }, [layers, projectName])

  const handleSaveProject = useCallback(async () => {
    const canvas = window.document.querySelector('canvas') as HTMLCanvasElement
    if (!canvas) return

    const docData = {
      id: 'project-1',
      name: projectName,
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff',
      colorMode: 'rgb' as const,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    }

    const layerCanvases = new Map<string, HTMLCanvasElement>()
    layers.forEach(layer => {
      layerCanvases.set(layer.id, canvas)
    })

    await ProjectExporter.exportProject(
      docData,
      layers,
      layerOrder,
      layerCanvases
    )
  }, [projectName, layers, layerOrder])

  // Create menus with actions
  const MENUS: Menu[] = [
    {
      label: 'Archivo',
      items: [
        { label: 'Nuevo', shortcut: 'Ctrl+N', action: handleNewDocument },
        { label: 'Abrir...', shortcut: 'Ctrl+O', action: handleOpenFile },
        { label: 'Abrir Reciente', disabled: true },
        { divider: true, label: '' },
        { label: 'Guardar Proyecto', shortcut: 'Ctrl+S', action: handleSaveProject },
        { label: 'Guardar Como...', shortcut: 'Ctrl+Shift+S', action: handleSaveProject },
        { divider: true, label: '' },
        { label: 'Exportar PNG', shortcut: 'Ctrl+E', action: handleExportPNG },
        { label: 'Exportar Capas (ZIP)', action: handleExportLayersZIP },
      ],
    },
    {
      label: 'Editar',
      items: [
        { label: 'Deshacer', shortcut: 'Ctrl+Z', action: undo, disabled: !canUndo },
        { label: 'Rehacer', shortcut: 'Ctrl+Shift+Z', action: redo, disabled: !canRedo },
        { divider: true, label: '' },
        { label: 'Cortar', shortcut: 'Ctrl+X' },
        { label: 'Copiar', shortcut: 'Ctrl+C' },
        { label: 'Pegar', shortcut: 'Ctrl+V' },
        { divider: true, label: '' },
        { label: 'Transformar Libre', shortcut: 'Ctrl+T' },
      ],
    },
    {
      label: 'Imagen',
      items: [
        { label: 'Tamaño de Imagen...' },
        { label: 'Tamaño del Lienzo...' },
        { divider: true, label: '' },
        { label: 'Rotar 90° Horario' },
        { label: 'Rotar 90° Antihorario' },
        { label: 'Voltear Horizontal' },
        { label: 'Voltear Vertical' },
      ],
    },
    {
      label: 'Capa',
      items: [
        {
          label: 'Nueva Capa',
          shortcut: 'Ctrl+Shift+N',
          action: () => {
            const id = `layer-${Date.now()}`
            addLayer({
              id,
              name: `Capa ${layers.length + 1}`,
              type: 'raster',
              visible: true,
              locked: false,
              opacity: 100,
              blendMode: 'normal',
              transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
            })
            setActiveLayer(id)
          }
        },
        { label: 'Duplicar Capa', shortcut: 'Ctrl+J' },
        { label: 'Eliminar Capa' },
        { divider: true, label: '' },
        { label: 'Agrupar Capas', shortcut: 'Ctrl+G' },
        { label: 'Desagrupar', shortcut: 'Ctrl+Shift+G' },
        { divider: true, label: '' },
        { label: 'Fusionar Hacia Abajo', shortcut: 'Ctrl+E' },
        { label: 'Aplanar Imagen' },
      ],
    },
    {
      label: 'Selección',
      items: [
        { label: 'Todo', shortcut: 'Ctrl+A' },
        { label: 'Deseleccionar', shortcut: 'Ctrl+D' },
        { label: 'Invertir', shortcut: 'Ctrl+Shift+I' },
        { divider: true, label: '' },
        { label: 'Calar...' },
      ],
    },
    {
      label: 'Filtro',
      items: [
        { label: 'Desenfocar' },
        { label: 'Enfocar' },
        { divider: true, label: '' },
        { label: 'Escala de Grises' },
        { label: 'Invertir Colores' },
      ],
    },
    {
      label: 'Vista',
      items: [
        { label: 'Acercar', shortcut: 'Ctrl+=', action: () => setZoom(zoom * 1.25) },
        { label: 'Alejar', shortcut: 'Ctrl+-', action: () => setZoom(zoom * 0.8) },
        { label: 'Ajustar a Pantalla', shortcut: 'Ctrl+0', action: () => actualSize() },
        { label: 'Tamaño Real', shortcut: 'Ctrl+1', action: () => setZoom(1) },
        { divider: true, label: '' },
        { label: 'Mostrar Reglas', shortcut: 'Ctrl+R' },
        { label: 'Mostrar Guías' },
        { label: 'Mostrar Cuadrícula' },
      ],
    },
    {
      label: 'Ayuda',
      items: [
        { label: 'Atajos de Teclado' },
        { label: 'Documentación' },
        { divider: true, label: '' },
        { label: 'Acerca de PhotoClone' },
      ],
    },
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.photoclone,.json"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div ref={menuRef} className="flex items-center">
        {MENUS.map((menu, index) => (
          <div key={menu.label} className="relative">
            <button
              className={`px-3 py-1.5 text-sm hover:bg-editor-surface-hover rounded transition-colors ${
                openMenu === index ? 'bg-editor-surface-hover' : ''
              }`}
              onClick={() => setOpenMenu(openMenu === index ? null : index)}
              onMouseEnter={() => openMenu !== null && setOpenMenu(index)}
            >
              {menu.label}
            </button>

            {openMenu === index && (
              <div className="absolute top-full left-0 mt-1 min-w-48 bg-editor-surface border border-editor-border rounded-lg shadow-xl py-1 z-50">
                {menu.items.map((item, itemIndex) =>
                  item.divider ? (
                    <div key={itemIndex} className="h-px bg-editor-border my-1" />
                  ) : (
                    <button
                      key={itemIndex}
                      className={`w-full px-4 py-2 text-sm text-left flex items-center justify-between ${
                        item.disabled
                          ? 'text-editor-text-muted cursor-not-allowed'
                          : 'hover:bg-editor-surface-hover'
                      }`}
                      disabled={item.disabled}
                      onClick={() => {
                        item.action?.()
                        setOpenMenu(null)
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-editor-text-muted text-xs ml-4">{item.shortcut}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
