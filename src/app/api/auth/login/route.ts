import { NextRequest, NextResponse } from 'next/server'
import {
  ensureSchema,
  fetchOne,
  verifyPassword,
} from '@/lib/auth/db'
import {
  DBUser,
  clientIp,
  err,
  issueSession,
  userPublic,
} from '@/lib/auth/session'
import { verifyRecaptcha } from '@/lib/auth/recaptcha'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return err(400, 'JSON inválido')
  }
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) return err(400, 'email y password requeridos')

  try {
    await ensureSchema()
  } catch (e: any) {
    return err(503, { error: `Persistencia no disponible: ${e?.message || e}` })
  }

  const ip = clientIp(req)
  const [ok] = await verifyRecaptcha(body.recaptcha_token, ip)
  if (!ok) return err(403, 'Verificación reCAPTCHA fallida')

  const user = await fetchOne<DBUser>('SELECT * FROM users WHERE email=?', [
    email,
  ])
  if (
    !user ||
    !user.active ||
    !(await verifyPassword(password, user.password_hash))
  ) {
    return err(401, 'Credenciales inválidas')
  }
  const res = NextResponse.json({ ok: true, user: userPublic(user) })
  await issueSession(res, user.id, req)
  return res
}
