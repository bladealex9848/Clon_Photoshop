import { NextRequest } from 'next/server'
import { json, apiError, preflight } from '@/lib/api/respond'
import { verifyApiKeyAny, publicKey } from '@/lib/api/keys'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return preflight()
}

export async function GET(req: NextRequest) {
  const v = await verifyApiKeyAny(req)
  if (!v.ok || !v.row) return apiError(v.status || 401, v.error || 'API key inválida')
  return json({ ok: true, key: publicKey(v.row) })
}
