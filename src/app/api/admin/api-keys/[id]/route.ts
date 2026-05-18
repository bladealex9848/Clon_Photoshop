import { NextRequest, NextResponse } from 'next/server'
import { currentUser, err } from '@/lib/auth/session'
import { revokeApiKey, setApiKeyActive } from '@/lib/api/keys'

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = await requireAdmin(req)
  if (a instanceof NextResponse) return a
  const { id } = await params
  await revokeApiKey(parseInt(id, 10))
  return NextResponse.json({ ok: true, revoked: parseInt(id, 10) })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const a = await requireAdmin(req)
  if (a instanceof NextResponse) return a
  const { id } = await params
  let body: any
  try {
    body = await req.json()
  } catch {
    return err(400, 'JSON inválido')
  }
  await setApiKeyActive(parseInt(id, 10), !!body.active)
  return NextResponse.json({ ok: true, id: parseInt(id, 10), active: !!body.active })
}
