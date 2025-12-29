'use client'

import { useState } from 'react'

export function AIPanel() {
  const [layerCount, setLayerCount] = useState(4)
  const [instructions, setInstructions] = useState('')
  const [infiniteDecomposition, setInfiniteDecomposition] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDecompose = async () => {
    setIsProcessing(true)
    // TODO: Implementar llamada a la API
    setTimeout(() => {
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-editor-accent">auto_awesome</span>
        <h3 className="font-semibold text-editor-text-bright">Separar en Capas</h3>
      </div>

      {/* Layer Count */}
      <div className="mb-4">
        <label className="block text-xs text-editor-text-muted mb-2">
          Número de capas: <span className="text-editor-text-bright font-medium">{layerCount}</span>
        </label>
        <input
          type="range"
          min={2}
          max={10}
          value={layerCount}
          onChange={(e) => setLayerCount(Number(e.target.value))}
          className="w-full accent-editor-accent"
        />
        <div className="flex justify-between text-xs text-editor-text-muted mt-1">
          <span>2</span>
          <span>10</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4">
        <label className="block text-xs text-editor-text-muted mb-2">
          Instrucciones de estructura (opcional)
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Ej: separa persona, pelo, ropa, fondo, sombras..."
          className="input text-sm resize-none"
          rows={3}
        />
      </div>

      {/* Infinite Decomposition Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <label className="text-sm text-editor-text">Descomposición infinita</label>
          <p className="text-xs text-editor-text-muted">Permite refinar capas en subcapas</p>
        </div>
        <button
          onClick={() => setInfiniteDecomposition(!infiniteDecomposition)}
          className={`w-11 h-6 rounded-full transition-colors ${
            infiniteDecomposition ? 'bg-editor-accent' : 'bg-editor-border'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
              infiniteDecomposition ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Decompose Button */}
      <button
        onClick={handleDecompose}
        disabled={isProcessing}
        className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Procesando...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">auto_awesome</span>
            Separar Capas con IA
          </>
        )}
      </button>

      {/* Info */}
      <div className="mt-4 p-3 bg-editor-bg rounded-lg border border-editor-border">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-editor-accent text-base mt-0.5">info</span>
          <div className="text-xs text-editor-text-muted">
            <p className="mb-1">La IA analizará tu imagen y la separará en capas RGBA independientes.</p>
            <p>Cada capa tendrá transparencia real y podrás editarla individualmente.</p>
          </div>
        </div>
      </div>

      {/* Refine Selected Layer */}
      <div className="mt-4 pt-4 border-t border-editor-border">
        <button
          disabled={!infiniteDecomposition}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-editor-border rounded text-sm hover:bg-editor-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-outlined text-base">layers</span>
          Refinar Capa Seleccionada
        </button>
      </div>
    </div>
  )
}
