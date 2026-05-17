import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/auth/db'
import { clientIp, err, finalizeC360 } from '@/lib/auth/session'
import { verifyRecaptcha } from '@/lib/auth/recaptcha'
import * as c360 from '@/lib/auth/cedula360'

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

  let data: any
  try {
    data = await c360.login(email, password, ip)
  } catch (e: any) {
    if (e instanceof c360.Cedula360Error) {
      const detail =
        e.payload && typeof e.payload === 'object'
          ? e.payload
          : { error: String(e.payload) }
      return NextResponse.json(detail, { status: e.status })
    }
    return err(502, { error: 'Error contactando Cédula 360' })
  }
  if (data.mfa_required) {
    return NextResponse.json({
      ok: true,
      mfa_required: true,
      session_id: data.session_id,
      methods: data.methods || [],
      email: data.email || email,
    })
  }
  if (data.token) return finalizeC360(data, req)
  return err(502, { error: 'Respuesta inesperada de Cédula 360' })
}
