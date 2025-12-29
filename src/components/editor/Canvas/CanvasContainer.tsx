'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useLayerStore } from '@/stores/useLayerStore'
import { useToolStore } from '@/stores/useToolStore'
import { useViewStore } from '@/stores/useViewStore'
import { LayerEngine } from '@/lib/canvas/LayerEngine'
import { CompositeRenderer } from '@/lib/canvas/CompositeRenderer'
import {
  brushTool,
  eraserTool,
  moveTool,
  eyedropperTool,
  zoomTool,
  handTool,
} from '@/lib/tools'
import type { ToolContext, ToolEvent } from '@/lib/tools'

export function CanvasContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerEngineRef = useRef<LayerEngine | null>(null)
  const compositorRef = useRef<CompositeRenderer | null>(null)

  const [isPanning, setIsPanning] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Stores
  const { getOrderedLayers, activeLayerId, getLayer, addLayer } = useLayerStore()
  const { activeTool, config, primaryColor, secondaryColor, setPrimaryColor } = useToolStore()
  const { zoom, panX, panY, setZoom, addPan } = useViewStore()

  const layers = getOrderedLayers()
  const canvasSize = { width: 1920, height: 1080 }

  // Handle file drop
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor arrastra solo archivos de imagen')
      return
    }

    const layerId = `layer-${Date.now()}`
    const layerName = file.name.replace(/\.[^/.]+$/, '')

    // Crear la capa primero con imageUrl
    const imageUrl = URL.createObjectURL(file)
    addLayer({
      id: layerId,
      name: layerName,
      type: 'raster',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
      imageUrl: imageUrl,
    })

    // Cargar la imagen en la capa usando el LayerEngine del CompositeRenderer
    const compositor = compositorRef.current
    if (compositor) {
      await compositor.layerEngine.loadImageToLayer(layerId, imageUrl)
    }

    // No revocamos la URL porque la capa la necesita para mostrar la miniatura
  }, [addLayer])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  // Initialize canvas engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    layerEngineRef.current = new LayerEngine(canvasSize.width, canvasSize.height)
    compositorRef.current = new CompositeRenderer(canvas, canvasSize.width, canvasSize.height)

    // Initialize with white background if no layers
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#a0a0a0'
      ctx.font = '32px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Arrastra una imagen o usa IA para crear capas', canvas.width / 2, canvas.height / 2)
    }
  }, [canvasSize.width, canvasSize.height])

  // Composite layers when they change
  const { layerOrder } = useLayerStore()

  useEffect(() => {
    if (!compositorRef.current) return
    if (layers.length === 0) return

    compositorRef.current.render(layers, layerOrder)
  }, [layers, layerOrder])

  // Load images into LayerEngine when layers have imageUrl
  useEffect(() => {
    const compositor = compositorRef.current
    if (!compositor) return

    // Load images for layers that have imageUrl but haven't been loaded yet
    layers.forEach(async (layer) => {
      if (layer.imageUrl && layer.type === 'raster') {
        // Check if this layer's canvas is empty by trying to get it
        const layerCanvas = compositor.layerEngine.getLayerCanvas(layer.id)
        const ctx = layerCanvas.getContext('2d')
        if (ctx) {
          // Try to get a pixel to check if canvas is empty
          const pixel = ctx.getImageData(0, 0, 1, 1).data
          // If completely transparent (all zeros), load the image
          const isEmpty = pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 0
          if (isEmpty) {
            await compositor.layerEngine.loadImageToLayer(layer.id, layer.imageUrl)
          }
        }
      }
    })
  }, [layers])

  // Get current tool instance
  const getCurrentTool = useCallback(() => {
    switch (activeTool) {
      case 'brush': return brushTool
      case 'eraser': return eraserTool
      case 'move': return moveTool
      case 'eyedropper': return eyedropperTool
      case 'zoom': return zoomTool
      case 'hand': return handTool
      default: return null
    }
  }, [activeTool])

  // Create tool context
  const createToolContext = useCallback((): ToolContext | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    if (!activeLayerId) return null

    return {
      canvas,
      ctx,
      layerId: activeLayerId,
      primaryColor,
      secondaryColor,
    }
  }, [activeLayerId, primaryColor, secondaryColor])

  // Convert mouse event to canvas coordinates
  const getCanvasCoords = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  // Create tool event from mouse event
  const createToolEvent = useCallback((e: React.MouseEvent): ToolEvent => {
    const coords = getCanvasCoords(e)
    return {
      x: coords.x,
      y: coords.y,
      pressure: 1,
      button: e.button,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    }
  }, [getCanvasCoords])

  // Handle wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(Math.min(Math.max(zoom * delta, 0.1), 32))
  }, [zoom, setZoom])

  // Add wheel listener with passive: false
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Alt+click for pan
    if (e.button === 1 || (e.button === 0 && e.altKey) || activeTool === 'hand') {
      setIsPanning(true)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      return
    }

    // Tool handling
    const tool = getCurrentTool()
    const context = createToolContext()

    if (tool && context) {
      setIsDrawing(true)
      const event = createToolEvent(e)

      // Set up eyedropper callback if needed
      if (activeTool === 'eyedropper') {
        eyedropperTool.setOnColorPick(setPrimaryColor)
      }

      tool.onMouseDown(context, event)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.x
      const dy = e.clientY - lastMousePos.y
      addPan(dx, dy)
      setLastMousePos({ x: e.clientX, y: e.clientY })
      return
    }

    if (isDrawing) {
      const tool = getCurrentTool()
      const context = createToolContext()

      if (tool && context) {
        const event = createToolEvent(e)
        tool.onMouseMove(context, event)
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDrawing) {
      const tool = getCurrentTool()
      const context = createToolContext()

      if (tool && context) {
        const event = createToolEvent(e)
        tool.onMouseUp(context, event)
      }
      setIsDrawing(false)
    }
  }

  // Get cursor based on active tool
  const getCursor = () => {
    if (isPanning) return 'grabbing'
    switch (activeTool) {
      case 'brush':
      case 'eraser':
        return 'crosshair'
      case 'move':
        return 'move'
      case 'eyedropper':
        return 'crosshair'
      case 'zoom':
        return 'zoom-in'
      case 'hand':
        return 'grab'
      case 'text':
        return 'text'
      default:
        return 'default'
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-editor-bg">
      {/* Rulers */}
      <div className="flex">
        {/* Corner */}
        <div className="w-6 h-6 bg-editor-surface border-r border-b border-editor-border" />
        {/* Horizontal Ruler */}
        <div className="flex-1 h-6 bg-editor-surface border-b border-editor-border relative overflow-hidden">
          <div
            className="absolute flex"
            style={{ transform: `translateX(${panX}px) scale(${zoom}, 1)`, transformOrigin: 'left' }}
          >
            {Array.from({ length: Math.ceil(canvasSize.width / 100) + 1 }).map((_, i) => (
              <div key={i} className="relative" style={{ width: 100 }}>
                <div className="absolute left-0 h-2 w-px bg-editor-text-muted bottom-0" />
                <span className="absolute left-1 bottom-0 text-[9px] text-editor-text-muted">
                  {i * 100}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Vertical Ruler */}
        <div className="w-6 bg-editor-surface border-r border-editor-border relative overflow-hidden">
          <div
            className="absolute"
            style={{ transform: `translateY(${panY}px) scale(1, ${zoom})`, transformOrigin: 'top' }}
          >
            {Array.from({ length: Math.ceil(canvasSize.height / 100) + 1 }).map((_, i) => (
              <div key={i} className="relative" style={{ height: 100 }}>
                <div className="absolute top-0 w-2 h-px bg-editor-text-muted right-0" />
                <span
                  className="absolute right-2 top-1 text-[9px] text-editor-text-muted"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {i * 100}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className={`flex-1 canvas-container flex items-center justify-center transition-colors ${
            isDragging ? 'bg-editor-accent/10' : ''
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{ cursor: getCursor() }}
        >
          <div
            style={{
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              transformOrigin: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            <canvas
              ref={canvasRef}
              className="bg-white"
              style={{ display: 'block' }}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-editor-surface border-t border-editor-border flex items-center px-3 text-xs text-editor-text-muted">
        <span>{canvasSize.width} × {canvasSize.height} px</span>
        <span className="mx-2">|</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span className="mx-2">|</span>
        <span>RGB</span>
        <span className="mx-2">|</span>
        <span>Herramienta: {activeTool}</span>
        {activeLayerId && (
          <>
            <span className="mx-2">|</span>
            <span>Capa: {getLayer(activeLayerId)?.name || 'Ninguna'}</span>
          </>
        )}
      </div>
    </div>
  )
}
