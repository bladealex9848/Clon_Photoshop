import { NextRequest } from 'next/server'
import { currentUser, err, userPublic } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

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
  return NextResponse.json({ user: userPublic(user) })
}
