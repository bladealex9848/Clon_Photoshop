import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/auth/db'
import { clientIp, err, finalizeC360 } from '@/lib/auth/session'
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
  const sessionId = String(body.session_id || '')
  const method = String(body.method || '')
  const code = String(body.code || '')
  if (!sessionId || !method || !code)
    return err(400, 'session_id, method y code requeridos')

  try {
    await ensureSchema()
  } catch (e: any) {
    return err(503, { error: `Persistencia no disponible: ${e?.message || e}` })
  }

  const ip = clientIp(req)
  let data: any
  try {
    data = await c360.mfaVerify(sessionId, method, code, ip)
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
  if (data.token) return finalizeC360(data, req)
  return err(502, { error: 'MFA no devolvió token' })
}
