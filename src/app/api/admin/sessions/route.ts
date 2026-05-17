import { NextRequest, NextResponse } from 'next/server'
import { fetchAll } from '@/lib/auth/db'
import { currentUser, err } from '@/lib/auth/session'

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
  const rows = await fetchAll<any>(
    `SELECT token, created_at, expires_at, user_agent, ip FROM sessions
     WHERE user_id=? ORDER BY created_at DESC LIMIT 50`,
    [user.id]
  )
  return NextResponse.json({
    sessions: rows.map((r) => ({
      token_preview: String(r.token).slice(0, 8) + '…',
      created_at: r.created_at ? new Date(r.created_at).toISOString() : null,
      expires_at: r.expires_at ? new Date(r.expires_at).toISOString() : null,
      user_agent: r.user_agent,
      ip: r.ip,
    })),
  })
}
