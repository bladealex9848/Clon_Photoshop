/**
 * Puente de historial: registra snapshots de la ESTRUCTURA de capas
 * (orden, visibilidad, opacidad, blend, nombres) y permite navegar.
 * Limitación conocida: no captura píxeles de filtros/pincel (igual que
 * el comportamiento previo de undo/redo).
 */
import { useLayerStore } from '@/stores/useLayerStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import type { HistoryAction } from '@/types'

let restoring = false
let timer: ReturnType<typeof setTimeout> | null = null
let started = false

export function initHistory() {
  if (started) return
  started = true

  // Snapshot inicial.
  const s = useLayerStore.getState()
  useHistoryStore.getState().pushAction('init', 'Estado inicial', s.layers, s.layerOrder, s.activeLayerId)

  useLayerStore.subscribe((state, prev) => {
    if (restoring) return
    // Solo registrar cambios estructurales relevantes.
    const changed =
      state.layerOrder !== prev.layerOrder ||
      state.layers !== prev.layers
    if (!changed) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const cur = useLayerStore.getState()
      const count = Object.keys(cur.layers).length
      const prevCount = Object.keys(prev.layers).length
      let name = 'Edición de capa'
      if (count > prevCount) name = 'Nueva capa'
      else if (count < prevCount) name = 'Eliminar capa'
      else if (cur.layerOrder !== prev.layerOrder) name = 'Reordenar capas'
      useHistoryStore.getState().pushAction('layers', name, cur.layers, cur.layerOrder, cur.activeLayerId)
    }, 350)
  })
}

function restore(a: HistoryAction | null) {
  if (!a) return
  restoring = true
  useLayerStore.setState({
    layers: JSON.parse(JSON.stringify(a.layerSnapshots)),
    layerOrder: [...a.layerOrder],
    activeLayerId: a.activeLayerId,
    selectedLayerIds: a.activeLayerId ? [a.activeLayerId] : [],
  })
  setTimeout(() => { restoring = false }, 0)
}

export function applyUndo() {
  const h = useHistoryStore.getState()
  const a = h.undo()
  if (a) restore(a)
}

export function applyRedo() {
  const h = useHistoryStore.getState()
  const a = h.redo()
  if (a) restore(a)
}

export function applyJump(index: number) {
  const h = useHistoryStore.getState()
  const a = h.jumpToAction(index)
  if (a) restore(a)
}
