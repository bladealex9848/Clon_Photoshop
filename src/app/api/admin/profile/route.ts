import { NextRequest, NextResponse } from 'next/server'
import { execute, fetchOne, hashPassword } from '@/lib/auth/db'
import { DBUser, currentUser, err, userPublic } from '@/lib/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  let user
  try {
    user = await currentUser(req)
  } catch (e: any) {
    return err(503, { error: `Persistencia no disponible: ${e?.message || e}` })
  }
  if (!user) return err(401, 'No autenticado')
  return NextResponse.json({ user: userPublic(user) })
}

export async function PUT(req: NextRequest) {
  let user
  try {
    user = await currentUser(req)
  } catch (e: any) {
    return err(503, { error: `Persistencia no disponible: ${e?.message || e}` })
  }
  if (!user) return err(401, 'No autenticado')
  let body: any
  try {
    body = await req.json()
  } catch {
    return err(400, 'JSON inválido')
  }
  if (body.name !== undefined)
    await execute('UPDATE users SET name=? WHERE id=?', [
      String(body.name).trim(),
      user.id,
    ])
  if (body.password) {
    if (String(body.password).length < 8)
      return err(400, 'Contraseña mínima 8 caracteres')
    await execute('UPDATE users SET password_hash=? WHERE id=?', [
      await hashPassword(body.password),
      user.id,
    ])
  }
  const fresh = await fetchOne<DBUser>('SELECT * FROM users WHERE id=?', [
    user.id,
  ])
  return NextResponse.json({ ok: true, user: userPublic(fresh!) })
}
