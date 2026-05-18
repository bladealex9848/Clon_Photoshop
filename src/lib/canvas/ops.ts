/**
 * Operaciones de píxeles para filtros y transformaciones. Todas operan
 * sobre el contexto 2D de la capa (canvas offscreen tamaño documento).
 */
import type { SelectionRect } from '@/stores/useSelectionStore'

type Ctx = OffscreenCanvasRenderingContext2D

function region(w: number, h: number, sel: SelectionRect | null) {
  if (!sel) return { x: 0, y: 0, w, h }
  const x = Math.max(0, Math.min(w, Math.round(sel.x)))
  const y = Math.max(0, Math.min(h, Math.round(sel.y)))
  return {
    x,
    y,
    w: Math.max(1, Math.min(w - x, Math.round(sel.width))),
    h: Math.max(1, Math.min(h - y, Math.round(sel.height))),
  }
}

export function invertColors(ctx: Ctx, w: number, h: number, sel: SelectionRect | null) {
  const r = region(w, h, sel)
  const img = ctx.getImageData(r.x, r.y, r.w, r.h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i]
    d[i + 1] = 255 - d[i + 1]
    d[i + 2] = 255 - d[i + 2]
  }
  ctx.putImageData(img, r.x, r.y)
}

export function grayscale(ctx: Ctx, w: number, h: number, sel: SelectionRect | null) {
  const r = region(w, h, sel)
  const img = ctx.getImageData(r.x, r.y, r.w, r.h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    d[i] = d[i + 1] = d[i + 2] = g
  }
  ctx.putImageData(img, r.x, r.y)
}

/** Desenfoque gaussiano usando ctx.filter sobre una copia. */
export function blur(ctx: Ctx, w: number, h: number, radius = 3) {
  const tmp = new OffscreenCanvas(w, h)
  const tctx = tmp.getContext('2d')
  if (!tctx) return
  tctx.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  ctx.filter = `blur(${radius}px)`
  ctx.drawImage(tmp, 0, 0)
  ctx.restore()
}

/** Enfoque por convolución 3x3 (unsharp simple). */
export function sharpen(ctx: Ctx, w: number, h: number, sel: SelectionRect | null) {
  const r = region(w, h, sel)
  const src = ctx.getImageData(r.x, r.y, r.w, r.h)
  const out = ctx.createImageData(r.w, r.h)
  const k = [0, -1, 0, -1, 5, -1, 0, -1, 0]
  const sd = src.data
  const od = out.data
  for (let y = 0; y < r.h; y++) {
    for (let x = 0; x < r.w; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0
        let ki = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = Math.min(r.w - 1, Math.max(0, x + kx))
            const py = Math.min(r.h - 1, Math.max(0, y + ky))
            sum += sd[(py * r.w + px) * 4 + c] * k[ki++]
          }
        }
        od[(y * r.w + x) * 4 + c] = Math.min(255, Math.max(0, sum))
      }
      od[(y * r.w + x) * 4 + 3] = sd[(y * r.w + x) * 4 + 3]
    }
  }
  ctx.putImageData(out, r.x, r.y)
}

/** Rota el contenido 90° (dir = 1 horario, -1 antihorario). */
export function rotate90(ctx: Ctx, w: number, h: number, dir: 1 | -1) {
  const tmp = new OffscreenCanvas(w, h)
  const tctx = tmp.getContext('2d')
  if (!tctx) return
  tctx.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((dir * 90 * Math.PI) / 180)
  ctx.translate(-w / 2, -h / 2)
  ctx.drawImage(tmp, 0, 0)
  ctx.restore()
}

export function flip(ctx: Ctx, w: number, h: number, axis: 'h' | 'v') {
  const tmp = new OffscreenCanvas(w, h)
  const tctx = tmp.getContext('2d')
  if (!tctx) return
  tctx.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  if (axis === 'h') {
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
  } else {
    ctx.translate(0, h)
    ctx.scale(1, -1)
  }
  ctx.drawImage(tmp, 0, 0)
  ctx.restore()
}

/** Escala el contenido de la capa por un factor (Tamaño de Imagen). */
export function scaleContent(ctx: Ctx, w: number, h: number, factor: number) {
  const tmp = new OffscreenCanvas(w, h)
  const tctx = tmp.getContext('2d')
  if (!tctx) return
  tctx.drawImage(ctx.canvas, 0, 0)
  ctx.clearRect(0, 0, w, h)
  const nw = w * factor
  const nh = h * factor
  ctx.drawImage(tmp, (w - nw) / 2, (h - nh) / 2, nw, nh)
}

export function clearRegion(ctx: Ctx, w: number, h: number, sel: SelectionRect | null) {
  const r = region(w, h, sel)
  ctx.clearRect(r.x, r.y, r.w, r.h)
}
