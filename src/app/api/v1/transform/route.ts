import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { json, apiError, preflight } from '@/lib/api/respond'
import { verifyApiKey, recordUsage } from '@/lib/api/keys'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export function OPTIONS() {
  return preflight()
}

async function loadBuffer(src: string): Promise<Buffer> {
  if (src.startsWith('http')) {
    const r = await fetch(src)
    if (!r.ok) throw new Error(`No se pudo descargar la imagen (${r.status})`)
    return Buffer.from(await r.arrayBuffer())
  }
  const b64 = src.startsWith('data:') ? src.split(',')[1] : src
  return Buffer.from(b64, 'base64')
}

export async function POST(req: NextRequest) {
  const v = await verifyApiKey(req, 'transform')
  if (!v.ok) return apiError(v.status!, v.error!)

  let body: any
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'JSON inválido')
  }
  const src = body.image || body.imageUrl || body.imageBase64
  if (!src) return apiError(400, "Falta 'image'")
  const ops: any[] = Array.isArray(body.ops) ? body.ops : []
  if (ops.length === 0) return apiError(400, "Falta 'ops' (array de operaciones)")

  let buf: Buffer
  try {
    buf = await loadBuffer(src)
  } catch (e: any) {
    return apiError(400, e?.message || 'Imagen no válida')
  }

  try {
    let img = sharp(buf, { failOn: 'none' })
    for (const op of ops) {
      switch (op.type) {
        case 'resize':
          img = img.resize(op.width || null, op.height || null, {
            fit: op.fit || 'inside',
            withoutEnlargement: op.withoutEnlargement !== false,
          })
          break
        case 'rotate':
          img = img.rotate(op.angle ?? 90)
          break
        case 'flip': // vertical
          img = img.flip()
          break
        case 'flop': // horizontal
          img = img.flop()
          break
        case 'grayscale':
          img = img.grayscale()
          break
        case 'negate':
          img = img.negate({ alpha: false })
          break
        case 'blur':
          img = img.blur(Math.max(0.3, op.sigma ?? 3))
          break
        case 'sharpen':
          img = img.sharpen({ sigma: op.sigma ?? 1 })
          break
        case 'tint':
          img = img.tint(op.color || '#ffffff')
          break
        case 'extend':
          img = img.extend({ top: op.top || 0, bottom: op.bottom || 0, left: op.left || 0, right: op.right || 0, background: op.background || '#00000000' })
          break
        default:
          return apiError(400, `Operación no soportada: ${op.type}`)
      }
    }

    const fmt = ['png', 'jpeg', 'webp'].includes(body.format) ? body.format : 'png'
    if (fmt === 'png') img = img.png()
    else if (fmt === 'jpeg') img = img.jpeg({ quality: body.quality ?? 90 })
    else img = img.webp({ quality: body.quality ?? 90 })

    const out = await img.toBuffer({ resolveWithObject: true })
    await recordUsage(v.row!)
    const b64 = out.data.toString('base64')
    const asDataUri = (body.return || 'datauri') !== 'base64'
    return json({
      ok: true,
      image: asDataUri ? `data:image/${fmt};base64,${b64}` : b64,
      format: fmt,
      width: out.info.width,
      height: out.info.height,
      bytes: out.info.size,
    })
  } catch (e: any) {
    return apiError(500, e?.message || 'Error procesando la imagen')
  }
}
