'use client'

import { useState, useCallback } from 'react'
import type { BlendMode } from '@/types'
import { BLEND_MODES } from '@/constants'
import { EditLayerModal } from '../EditLayerModal'

interface DemoLayer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: BlendMode
  type: 'raster' | 'text' | 'group'
  thumbnail?: string
  imageUrl?: string
}

const DEMO_LAYERS: DemoLayer[] = [
  {
    id: '1',
    name: 'Capa 1',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    type: 'raster',
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '2',
    name: 'Fondo',
    visible: true,
    locked: true,
    opacity: 100,
    blendMode: 'normal',
    type: 'raster',
    imageUrl: 'https://picsum.photos/400/300?random=2'
  },
]

export function LayersPanel() {
  const [layers, setLayers] = useState<DemoLayer[]>(DEMO_LAYERS)
  const [selectedLayerId, setSelectedLayerId] = useState<string>('1')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [layerToEdit, setLayerToEdit] = useState<DemoLayer | null>(null)

  const toggleVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
  }

  const toggleLock = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l))
  }

  const addNewLayer = () => {
    const newLayer: DemoLayer = {
      id: Date.now().toString(),
      name: `Capa ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      type: 'raster',
    }
    setLayers([newLayer, ...layers])
    setSelectedLayerId(newLayer.id)
  }

  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return
    setLayers(layers.filter(l => l.id !== id))
    if (selectedLayerId === id) {
      setSelectedLayerId(layers[0].id === id ? layers[1]?.id : layers[0].id)
    }
  }

  const openEditModal = (layer: DemoLayer) => {
    setLayerToEdit(layer)
    setEditModalOpen(true)
  }

  const handleApplyEdit = useCallback((editedImageUrl: string) => {
    if (!layerToEdit) return

    setLayers(layers.map(l =>
      l.id === layerToEdit.id
        ? { ...l, imageUrl: editedImageUrl, thumbnail: editedImageUrl }
        : l
    ))
  }, [layerToEdit, layers])

  const selectedLayer = layers.find(l => l.id === selectedLayerId)

  return (
    <div className="flex flex-col h-full">
      {/* Blend Mode & Opacity */}
      <div className="p-3 border-b border-editor-border">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-editor-text-muted w-16">Fusión:</label>
          <select className="flex-1 bg-editor-bg border border-editor-border rounded px-2 py-1 text-xs">
            {BLEND_MODES.map(mode => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-editor-text-muted w-16">Opacidad:</label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue={100}
            className="flex-1 accent-editor-accent h-1"
          />
          <span className="text-xs text-editor-text w-8 text-right">100%</span>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-editor-border/50 ${
              selectedLayerId === layer.id ? 'bg-editor-active' : 'hover:bg-editor-surface-hover'
            }`}
            onClick={() => setSelectedLayerId(layer.id)}
          >
            {/* Visibility */}
            <button
              className="p-0.5 hover:bg-editor-surface-hover rounded"
              onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
            >
              <span className="material-symbols-outlined text-base">
                {layer.visible ? 'visibility' : 'visibility_off'}
              </span>
            </button>

            {/* Lock */}
            <button
              className="p-0.5 hover:bg-editor-surface-hover rounded"
              onClick={(e) => { e.stopPropagation(); toggleLock(layer.id); }}
            >
              <span className={`material-symbols-outlined text-base ${layer.locked ? 'text-editor-accent' : 'text-editor-text-muted'}`}>
                {layer.locked ? 'lock' : 'lock_open'}
              </span>
            </button>

            {/* Thumbnail */}
            <div className="w-10 h-10 bg-white rounded border border-editor-border flex-shrink-0 overflow-hidden">
              {layer.imageUrl ? (
                <img
                  src={layer.imageUrl}
                  alt={layer.name}
                  className="w-full h-full object-cover"
                />
              ) : layer.type === 'text' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-editor-text-muted">text_fields</span>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
              )}
            </div>

            {/* Name */}
            <span className="flex-1 text-sm truncate">{layer.name}</span>

            {/* Edit with AI Button */}
            {layer.type === 'raster' && !layer.locked && (
              <button
                className="p-1 hover:bg-indigo-600/20 rounded transition-colors group"
                onClick={(e) => { e.stopPropagation(); openEditModal(layer); }}
                title="Editar con IA"
              >
                <span className="material-symbols-outlined text-base text-indigo-400 group-hover:text-indigo-300">
                  auto_fix_high
                </span>
              </button>
            )}

            {/* Layer Type Icon */}
            {layer.type === 'group' && (
              <span className="material-symbols-outlined text-base text-editor-text-muted">folder</span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-1 p-2 border-t border-editor-border">
        <button
          className="p-1.5 hover:bg-editor-surface-hover rounded transition-colors"
          onClick={addNewLayer}
          title="Nueva capa"
        >
          <span className="material-symbols-outlined text-lg">add</span>
        </button>
        <button
          className="p-1.5 hover:bg-editor-surface-hover rounded transition-colors"
          title="Crear grupo"
        >
          <span className="material-symbols-outlined text-lg">create_new_folder</span>
        </button>
        <button
          className="p-1.5 hover:bg-editor-surface-hover rounded transition-colors"
          title="Duplicar capa"
        >
          <span className="material-symbols-outlined text-lg">content_copy</span>
        </button>
        <button
          className="p-1.5 hover:bg-indigo-600/20 rounded transition-colors group"
          onClick={() => selectedLayer && openEditModal(selectedLayer)}
          title="Editar capa con IA"
          disabled={!selectedLayer || selectedLayer.locked}
        >
          <span className="material-symbols-outlined text-lg text-indigo-400 group-hover:text-indigo-300">
            auto_fix_high
          </span>
        </button>
        <button
          className="p-1.5 hover:bg-editor-surface-hover rounded transition-colors"
          onClick={() => deleteLayer(selectedLayerId)}
          title="Eliminar capa"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>

      {/* Edit Layer Modal */}
      <EditLayerModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setLayerToEdit(null)
        }}
        layerName={layerToEdit?.name || ''}
        layerImageUrl={layerToEdit?.imageUrl || null}
        onApplyEdit={handleApplyEdit}
      />
    </div>
  )
}
