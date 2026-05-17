/**
 * Verificación reCAPTCHA v3 (claves de Cédula 360).
 *
 * Política fail-open: si no hay token, no hay secreto, o falla la red hacia
 * Google, NO se bloquea el login. Sólo se rechaza con token y score < umbral
 * (0.3 por defecto).
 */
const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

function minScore(): number {
  const v = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.3')
  return Number.isFinite(v) ? v : 0.3
}

export async function verifyRecaptcha(
  token: string | null | undefined,
  remoteIp: string | null
): Promise<[boolean, string]> {
  const secret = (process.env.RECAPTCHA_SECRET_KEY || '').trim()
  if (!secret) return [true, 'recaptcha_disabled']
  if (!token) return [true, 'no_token_fail_open']
  const form = new URLSearchParams({ secret, response: token })
  if (remoteIp) form.set('remoteip', remoteIp)
  let j: any
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 6000)
    const r = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: ctrl.signal,
      cache: 'no-store',
    })
    clearTimeout(t)
    j = await r.json()
  } catch {
    return [true, 'recaptcha_network_fail_open']
  }
  if (!j.success) return [true, 'recaptcha_unsuccessful_fail_open']
  const score = parseFloat(j.score ?? '0')
  if (score < minScore()) return [false, `recaptcha_low_score:${score}`]
  return [true, `recaptcha_ok:${score}`]
}
