/**
 * Servicio de API keys para el API público v1 de PhotoClone AI.
 *
 * - Tabla `api_keys` (creada idempotentemente, reusa el pool MariaDB).
 * - Clave en claro: `ck_live_<48 hex>`; se almacena solo el SHA-256.
 * - Scopes por clave, cuota mensual y rate-limit por minuto (memoria).
 * - Las claves las emiten administradores desde /admin.
 */
import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { pool, fetchOne, fetchAll, execute } from '@/lib/auth/db'

export const ALL_SCOPES = ['decompose', 'edit', 'transform'] as const
export type Scope = (typeof ALL_SCOPES)[number]

export interface ApiKeyRow {
  id: number
  name: string
  owner: string
  key_prefix: string
  key_hash: string
  scopes: string
  rate_per_min: number
  monthly_quota: number | null
  used_total: number
  used_month: number
  month_anchor: string
  active: number
  created_by: number | null
  created_at: Date | null
  last_used_at: Date | null
}

let _apiSchema = false
export async function ensureApiSchema(): Promise<void> {
  if (_apiSchema) return
  await pool().query(
    `CREATE TABLE IF NOT EXISTS api_keys (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(120) NOT NULL,
       owner VARCHAR(160) NOT NULL DEFAULT '',
       key_prefix VARCHAR(24) NOT NULL,
       key_hash CHAR(64) NOT NULL UNIQUE,
       scopes VARCHAR(255) NOT NULL DEFAULT 'decompose,edit,transform',
       rate_per_min INT NOT NULL DEFAULT 60,
       monthly_quota INT NULL,
       used_total BIGINT NOT NULL DEFAULT 0,
       used_month INT NOT NULL DEFAULT 0,
       month_anchor CHAR(7) NOT NULL DEFAULT '',
       active TINYINT(1) NOT NULL DEFAULT 1,
       created_by INT NULL,
       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
       last_used_at DATETIME NULL
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  )
  _apiSchema = true
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex')
}

function monthStr(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function publicKey(r: ApiKeyRow) {
  return {
    id: r.id,
    name: r.name,
    owner: r.owner,
    prefix: r.key_prefix,
    scopes: r.scopes.split(',').filter(Boolean),
    rate_per_min: r.rate_per_min,
    monthly_quota: r.monthly_quota,
    used_total: Number(r.used_total),
    used_month: r.used_month,
    month: r.month_anchor,
    active: !!r.active,
    created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
    last_used_at: r.last_used_at ? new Date(r.last_used_at).toISOString() : null,
  }
}

export async function createApiKey(opts: {
  name: string
  owner?: string
  scopes?: string[]
  ratePerMin?: number
  monthlyQuota?: number | null
  createdBy?: number | null
}): Promise<{ key: string; row: ApiKeyRow }> {
  await ensureApiSchema()
  const secret = crypto.randomBytes(24).toString('hex') // 48 hex
  const key = `ck_live_${secret}`
  const prefix = `ck_live_${secret.slice(0, 6)}`
  const scopes = (opts.scopes && opts.scopes.length ? opts.scopes : [...ALL_SCOPES])
    .filter((s) => (ALL_SCOPES as readonly string[]).includes(s))
    .join(',')
  const id = await execute(
    `INSERT INTO api_keys (name, owner, key_prefix, key_hash, scopes, rate_per_min, monthly_quota, month_anchor, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      opts.name.slice(0, 120),
      (opts.owner || '').slice(0, 160),
      prefix,
      sha256(key),
      scopes,
      opts.ratePerMin ?? 60,
      opts.monthlyQuota ?? null,
      monthStr(),
      opts.createdBy ?? null,
    ]
  )
  const row = (await fetchOne<ApiKeyRow>('SELECT * FROM api_keys WHERE id=?', [id]))!
  return { key, row }
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  await ensureApiSchema()
  return fetchAll<ApiKeyRow>('SELECT * FROM api_keys ORDER BY created_at DESC')
}

export async function revokeApiKey(id: number): Promise<void> {
  await ensureApiSchema()
  await execute('UPDATE api_keys SET active=0 WHERE id=?', [id])
}

export async function setApiKeyActive(id: number, active: boolean): Promise<void> {
  await ensureApiSchema()
  await execute('UPDATE api_keys SET active=? WHERE id=?', [active ? 1 : 0, id])
}

// ---- rate limit en memoria (ventana de 60s por clave) ----
const buckets = new Map<number, { count: number; reset: number }>()

export interface VerifyResult {
  ok: boolean
  status?: number
  error?: string
  row?: ApiKeyRow
}

export function extractKey(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim()
  const x = req.headers.get('x-api-key')
  return x ? x.trim() : null
}

/** Verifica la clave, scope, rate-limit y cuota. NO incrementa uso. */
export async function verifyApiKey(
  req: NextRequest,
  scope: Scope
): Promise<VerifyResult> {
  const raw = extractKey(req)
  if (!raw) return { ok: false, status: 401, error: 'Falta API key (Authorization: Bearer <key> o X-API-Key)' }
  await ensureApiSchema()
  const row = await fetchOne<ApiKeyRow>('SELECT * FROM api_keys WHERE key_hash=?', [
    crypto.createHash('sha256').update(raw).digest('hex'),
  ])
  if (!row) return { ok: false, status: 401, error: 'API key inválida' }
  if (!row.active) return { ok: false, status: 403, error: 'API key revocada' }
  if (!row.scopes.split(',').includes(scope))
    return { ok: false, status: 403, error: `La API key no tiene el scope '${scope}'` }

  // Rate limit
  const now = Date.now()
  const b = buckets.get(row.id)
  if (!b || now > b.reset) {
    buckets.set(row.id, { count: 0, reset: now + 60000 })
  }
  const bucket = buckets.get(row.id)!
  if (bucket.count >= row.rate_per_min)
    return { ok: false, status: 429, error: `Rate limit excedido (${row.rate_per_min}/min)` }

  // Cuota mensual
  const cur = monthStr()
  const usedMonth = row.month_anchor === cur ? row.used_month : 0
  if (row.monthly_quota != null && usedMonth >= row.monthly_quota)
    return { ok: false, status: 429, error: `Cuota mensual agotada (${row.monthly_quota})` }

  bucket.count++
  return { ok: true, row }
}

/** Valida la clave sin exigir scope ni consumir rate-limit (solo lectura). */
export async function verifyApiKeyAny(req: NextRequest): Promise<VerifyResult> {
  const raw = extractKey(req)
  if (!raw) return { ok: false, status: 401, error: 'Falta API key' }
  await ensureApiSchema()
  const row = await fetchOne<ApiKeyRow>('SELECT * FROM api_keys WHERE key_hash=?', [
    crypto.createHash('sha256').update(raw).digest('hex'),
  ])
  if (!row) return { ok: false, status: 401, error: 'API key inválida' }
  if (!row.active) return { ok: false, status: 403, error: 'API key revocada' }
  return { ok: true, row }
}

/** Incrementa contadores de uso (llamar tras una operación exitosa). */
export async function recordUsage(row: ApiKeyRow): Promise<void> {
  const cur = monthStr()
  if (row.month_anchor === cur) {
    await execute(
      'UPDATE api_keys SET used_total=used_total+1, used_month=used_month+1, last_used_at=UTC_TIMESTAMP() WHERE id=?',
      [row.id]
    )
  } else {
    await execute(
      'UPDATE api_keys SET used_total=used_total+1, used_month=1, month_anchor=?, last_used_at=UTC_TIMESTAMP() WHERE id=?',
      [cur, row.id]
    )
  }
}
