import { NextRequest, NextResponse } from 'next/server'
import { execute, fetchOne, hashPassword } from '@/lib/auth/db'
import { DBUser, currentUser, err, userPublic } from '@/lib/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin(req: NextRequest): Promise<DBUser | NextResponse> {
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin
  const userId = parseInt((await params).id, 10)
  const target = await fetchOne<DBUser>('SELECT * FROM users WHERE id=?', [
    userId,
  ])
  if (!target) return err(404, 'Usuario no encontrado')
  let body: any
  try {
    body = await req.json()
  } catch {
    return err(400, 'JSON inválido')
  }
  if (body.name !== undefined)
    await execute('UPDATE users SET name=? WHERE id=?', [
      String(body.name).trim(),
      userId,
    ])
  if (body.password) {
    if (String(body.password).length < 8)
      return err(400, 'Contraseña mínima 8 caracteres')
    await execute('UPDATE users SET password_hash=? WHERE id=?', [
      await hashPassword(body.password),
      userId,
    ])
  }
  if (body.role !== undefined) {
    if (!['admin', 'viewer'].includes(body.role))
      return err(400, 'role inválido')
    await execute('UPDATE users SET role=? WHERE id=?', [body.role, userId])
  }
  if (body.active !== undefined) {
    if (userId === admin.id && !body.active)
      return err(400, 'No puedes desactivarte a ti mismo')
    await execute('UPDATE users SET active=? WHERE id=?', [
      body.active ? 1 : 0,
      userId,
    ])
  }
  const u = await fetchOne<DBUser>('SELECT * FROM users WHERE id=?', [userId])
  return NextResponse.json({ ok: true, user: userPublic(u!) })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin
  const userId = parseInt((await params).id, 10)
  if (userId === admin.id) return err(400, 'No puedes eliminarte a ti mismo')
  if (!(await fetchOne('SELECT id FROM users WHERE id=?', [userId])))
    return err(404, 'Usuario no encontrado')
  await execute('DELETE FROM users WHERE id=?', [userId])
  return NextResponse.json({ ok: true })
}
