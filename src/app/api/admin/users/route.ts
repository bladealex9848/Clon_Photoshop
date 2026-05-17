import { NextRequest, NextResponse } from 'next/server'
import { execute, fetchAll, fetchOne, hashPassword } from '@/lib/auth/db'
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

export async function GET(req: NextRequest) {
  const a = await requireAdmin(req)
  if (a instanceof NextResponse) return a
  const rows = await fetchAll<DBUser>(
    'SELECT * FROM users ORDER BY created_at DESC'
  )
  return NextResponse.json({ users: rows.map(userPublic) })
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
  const role = body.role || 'viewer'
  if (!['admin', 'viewer'].includes(role)) return err(400, 'role inválido')
  const password = String(body.password || '')
  if (password.length < 8) return err(400, 'Contraseña mínima 8 caracteres')
  const email = String(body.email || '').trim().toLowerCase()
  if (!email) return err(400, 'email requerido')
  if (await fetchOne('SELECT id FROM users WHERE email=?', [email]))
    return err(409, 'Email ya registrado')
  const uid = await execute(
    'INSERT INTO users (email, password_hash, name, role, active) VALUES (?,?,?,?,?)',
    [
      email,
      await hashPassword(password),
      String(body.name || '').trim(),
      role,
      body.active === false ? 0 : 1,
    ]
  )
  const u = await fetchOne<DBUser>('SELECT * FROM users WHERE id=?', [uid])
  return NextResponse.json({ ok: true, user: userPublic(u!) })
}
