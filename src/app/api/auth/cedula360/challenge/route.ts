import { NextRequest, NextResponse } from 'next/server'
import { clientIp, err } from '@/lib/auth/session'
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
  if (!sessionId || !method) return err(400, 'session_id y method requeridos')
  const ip = clientIp(req)
  try {
    const data = await c360.mfaChallenge(sessionId, method, ip)
    return NextResponse.json({
      ok: true,
      ...(data && typeof data === 'object' ? data : {}),
    })
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
}
