/**
 * Cliente server-to-server para la alianza "Login con Cédula 360".
 *
 * Contrato del backend REAL de Cédula 360 (http://localhost:3081):
 *
 *   POST /api/auth/login {email,password}
 *     -> 200 {token, user:{email,name,...}}
 *     -> 200 {ok:true, mfa_required:true, session_id, methods, email}
 *     -> 401 {error}
 *
 *   POST /api/auth/mfa/challenge {session_id, method}
 *   POST /api/auth/mfa/verify   {session_id, method, code} -> {ok:true, token, user}
 *
 * CRÍTICO:
 * - NUNCA usar el puerto 9091 (stub que responde 200 sin autenticar).
 * - Cédula 360 limita /api/auth/* a 10/min POR IP (Express trust proxy=1).
 *   Se reenvía la IP real del usuario final en CADA llamada vía
 *   X-Forwarded-For / X-Real-IP para que el límite sea por usuario.
 * - Bypass opcional: si CEDULA360_INTERNAL_TOKEN está seteado, se añade
 *   x-internal-cron-token.
 */

function base(): string {
  return (process.env.CEDULA360_API_BASE || 'http://localhost:3081').replace(
    /\/+$/,
    ''
  )
}

function fwdHeaders(clientIp: string | null): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (clientIp) {
    h['X-Forwarded-For'] = clientIp
    h['X-Real-IP'] = clientIp
  }
  const internal = (process.env.CEDULA360_INTERNAL_TOKEN || '').trim()
  if (internal) h['x-internal-cron-token'] = internal
  return h
}

export class Cedula360Error extends Error {
  status: number
  payload: any
  constructor(status: number, payload: any) {
    super(`cedula360 ${status}`)
    this.status = status
    this.payload = payload
  }
}

async function post(
  path: string,
  body: Record<string, unknown>,
  clientIp: string | null
): Promise<any> {
  const url = `${base()}${path}`
  let r: Response
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 20000)
    r = await fetch(url, {
      method: 'POST',
      headers: fwdHeaders(clientIp),
      body: JSON.stringify(body),
      signal: ctrl.signal,
      cache: 'no-store',
    })
    clearTimeout(t)
  } catch (e: any) {
    throw new Cedula360Error(502, {
      error: `No se pudo contactar Cédula 360: ${e?.message || e}`,
    })
  }
  let data: any
  try {
    data = await r.json()
  } catch {
    data = { error: 'respuesta no-JSON de Cédula 360' }
  }
  if (r.status >= 400) {
    // Propaga el motivo y el HTTP real (429 sigue siendo 429).
    throw new Cedula360Error(r.status, data)
  }
  return data
}

export function login(email: string, password: string, ip: string | null) {
  return post('/api/auth/login', { email, password }, ip)
}

export function mfaChallenge(
  sessionId: string,
  method: string,
  ip: string | null
) {
  return post(
    '/api/auth/mfa/challenge',
    { session_id: sessionId, method },
    ip
  )
}

export function mfaVerify(
  sessionId: string,
  method: string,
  code: string,
  ip: string | null
) {
  return post(
    '/api/auth/mfa/verify',
    { session_id: sessionId, method, code },
    ip
  )
}
