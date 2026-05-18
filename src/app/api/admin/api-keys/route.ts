import { NextRequest, NextResponse } from 'next/server'
import { currentUser, err } from '@/lib/auth/session'
import { listApiKeys, createApiKey, publicKey, ALL_SCOPES } from '@/lib/api/keys'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin(req: NextRequest) {
  let user
  try {
    user = await currentUser(req)
  } catch (e: any) {
    return err(503, { error: `Persistencia no disponible: ${e?.message || e}` })
  }
  if (!user) return err(401, 'No autenticado')
  if (user.role !== 'admin') return err(403, 'Requiere rol admin')
  return user
}

export async function GET(req: NextRequest) {
  const a = await requireAdmin(req)
  if (a instanceof NextResponse) return a
  const rows = await listApiKeys()
  return NextResponse.json({ keys: rows.map(publicKey) })
}

export async function POST(req: NextRequest) {
  const a = await requireAdmin(req)
  if (a instanceof NextResponse) return a
  let body: any
  try {
    body = await req.json()
  } catch {
    return err(400, 'JSON inválido')
  }
  if (!body.name || !String(body.name).trim()) return err(400, 'Falta name')
  const scopes = Array.isArray(body.scopes) && body.scopes.length ? body.scopes : [...ALL_SCOPES]
  const { key, row } = await createApiKey({
    name: String(body.name).trim(),
    owner: body.owner ? String(body.owner).trim() : '',
    scopes,
    ratePerMin: body.ratePerMin ? parseInt(body.ratePerMin, 10) : 60,
    monthlyQuota:
      body.monthlyQuota === '' || body.monthlyQuota == null
        ? null
        : parseInt(body.monthlyQuota, 10),
    createdBy: (a as any).id,
  })
  // La clave en claro se devuelve UNA sola vez.
  return NextResponse.json({ key, info: publicKey(row) }, { status: 201 })
}
