/**
 * Gestión de sesión por cookie httponly + RBAC.
 * Mirror del contrato de DeepMap (cookie de sesión, 30 días, secure+lax).
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  ensureSchema,
  execute,
  fetchOne,
  newSessionToken,
  unusablePassword,
} from './db'

export const COOKIE_NAME = 'clon_ps_session'
export const SESSION_DAYS = 30

export interface DBUser {
  id: number
  email: string
  password_hash: string
  name: string
  role: 'admin' | 'viewer'
  active: number
  created_at: Date | null
  last_login_at: Date | null
}

export function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xreal = req.headers.get('x-real-ip')
  if (xreal) return xreal.trim()
  return '127.0.0.1'
}

export function userPublic(u: DBUser) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    active: !!u.active,
    created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
    last_login_at: u.last_login_at
      ? new Date(u.last_login_at).toISOString()
      : null,
  }
}

export async function issueSession(
  res: NextResponse,
  userId: number,
  req: NextRequest
): Promise<string> {
  const token = newSessionToken()
  const now = new Date()
  const expires = new Date(now.getTime() + SESSION_DAYS * 86400 * 1000)
  await execute(
    'INSERT INTO sessions (token, user_id, created_at, expires_at, user_agent, ip) VALUES (?,?,?,?,?,?)',
    [
      token,
      userId,
      now,
      expires,
      (req.headers.get('user-agent') || '').slice(0, 500),
      clientIp(req).slice(0, 60),
    ]
  )
  await execute('UPDATE users SET last_login_at=? WHERE id=?', [now, userId])
  res.cookies.set(COOKIE_NAME, token, {
    maxAge: SESSION_DAYS * 86400,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  })
  return token
}

/** Devuelve el usuario autenticado o null. Lanza si MariaDB no está. */
export async function currentUser(req: NextRequest): Promise<DBUser | null> {
  await ensureSchema()
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const row = await fetchOne<DBUser>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token=? AND s.expires_at > UTC_TIMESTAMP() AND u.active=1`,
    [token]
  )
  return row || null
}

export function err(status: number, detail: any) {
  return NextResponse.json(
    typeof detail === 'string' ? { error: detail } : detail,
    { status }
  )
}

/** Upsert federado (Cédula 360): viewer, password inutilizable, sin escalar. */
export async function upsertFederated(
  email: string,
  name: string
): Promise<DBUser> {
  email = email.trim().toLowerCase()
  const existing = await fetchOne<DBUser>(
    'SELECT * FROM users WHERE email=?',
    [email]
  )
  if (existing) {
    if (!existing.active) {
      await execute('UPDATE users SET active=1 WHERE id=?', [existing.id])
      existing.active = 1
    }
    return existing
  }
  const uid = await execute(
    "INSERT INTO users (email, password_hash, name, role, active) VALUES (?,?,?,'viewer',1)",
    [email, await unusablePassword(), name || email.split('@')[0]]
  )
  return (await fetchOne<DBUser>('SELECT * FROM users WHERE id=?', [uid]))!
}

/** Finaliza el login federado: upsert + sesión local + JSON. */
export async function finalizeC360(
  data: any,
  req: NextRequest
): Promise<NextResponse> {
  const userObj = data.user || {}
  const email = String(userObj.email || '').trim().toLowerCase()
  if (!email) return err(502, { error: 'Cédula 360 no devolvió email' })
  const local = await upsertFederated(email, userObj.name || '')
  const res = NextResponse.json({
    ok: true,
    via: 'cedula360',
    user: userPublic(local),
  })
  await issueSession(res, local.id, req)
  return res
}
