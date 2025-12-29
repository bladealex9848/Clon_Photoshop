'use client'

import { useState } from 'react'
import { LayersPanel } from './LayersPanel/LayersPanel'
import { AIPanel } from './AIPanel/AIPanel'

type Tab = 'layers' | 'properties' | 'history' | 'ai'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'layers', label: 'Capas', icon: 'layers' },
  { id: 'properties', label: 'Propiedades', icon: 'tune' },
  { id: 'history', label: 'Historial', icon: 'history' },
  { id: 'ai', label: 'IA', icon: 'auto_awesome' },
]

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('layers')

  return (
    <div className="w-72 bg-editor-surface border-l border-editor-border flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-editor-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs transition-colors ${
              activeTab === tab.id
                ? 'bg-editor-bg text-editor-text-bright border-b-2 border-editor-accent'
                : 'text-editor-text-muted hover:text-editor-text hover:bg-editor-surface-hover'
            }`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'layers' && <LayersPanel />}
        {activeTab === 'properties' && <PropertiesPanel />}
        {activeTab === 'history' && <HistoryPanel />}
        {activeTab === 'ai' && <AIPanel />}
      </div>
    </div>
  )
}

function PropertiesPanel() {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-editor-text-muted uppercase mb-2">Transformar</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-editor-text-muted">X</label>
            <input type="number" className="input text-xs py-1" defaultValue={0} />
          </div>
          <div>
            <label className="text-xs text-editor-text-muted">Y</label>
            <input type="number" className="input text-xs py-1" defaultValue={0} />
          </div>
          <div>
            <label className="text-xs text-editor-text-muted">Ancho</label>
            <input type="number" className="input text-xs py-1" defaultValue={1920} />
          </div>
          <div>
            <label className="text-xs text-editor-text-muted">Alto</label>
            <input type="number" className="input text-xs py-1" defaultValue={1080} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-editor-text-muted uppercase mb-2">Opacidad</h3>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            defaultValue={100}
            className="flex-1 accent-editor-accent"
          />
          <span className="text-xs text-editor-text w-8 text-right">100%</span>
        </div>
      </div>
    </div>
  )
}

function HistoryPanel() {
  const historyItems = [
    { id: 1, name: 'Abrir Documento', icon: 'folder_open' },
    { id: 2, name: 'Nueva Capa', icon: 'add' },
    { id: 3, name: 'Pincelada', icon: 'brush' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {historyItems.map((item, index) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 px-3 py-2 hover:bg-editor-surface-hover cursor-pointer ${
              index === historyItems.length - 1 ? 'bg-editor-active' : ''
            }`}
          >
            <span className="material-symbols-outlined text-base text-editor-text-muted">
              {item.icon}
            </span>
            <span className="text-sm">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
