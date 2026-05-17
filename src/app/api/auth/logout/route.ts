import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/auth/db'
import { COOKIE_NAME } from '@/lib/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (token) {
    try {
      await execute('DELETE FROM sessions WHERE token=?', [token])
    } catch {
      /* noop */
    }
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return res
}
