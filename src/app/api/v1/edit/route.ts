import { NextRequest } from 'next/server'
import { json, apiError, preflight } from '@/lib/api/respond'
import { verifyApiKey, recordUsage } from '@/lib/api/keys'
import { editImage } from '@/lib/ai/replicate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

export function OPTIONS() {
  return preflight()
}

export async function POST(req: NextRequest) {
  const v = await verifyApiKey(req, 'edit')
  if (!v.ok) return apiError(v.status!, v.error!)

  let body: any
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'JSON inválido')
  }
  const image = body.image || body.imageUrl || body.imageBase64
  if (!image) return apiError(400, "Falta 'image'")
  if (!body.prompt) return apiError(400, "Falta 'prompt'")

  try {
    const result = await editImage({
      image,
      prompt: body.prompt,
      guidance: body.guidance,
      strength: body.strength,
      numInferenceSteps: body.numInferenceSteps,
      aspectRatio: body.aspectRatio,
    })
    await recordUsage(v.row!)
    return json({ ok: true, ...result })
  } catch (e: any) {
    return apiError(502, e?.message || 'Error en la IA')
  }
}
