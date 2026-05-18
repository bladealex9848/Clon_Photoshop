import { json, preflight } from '@/lib/api/respond'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function OPTIONS() {
  return preflight()
}

export function GET() {
  return json({
    ok: true,
    service: 'PhotoClone AI API',
    version: 'v1',
    aiConfigured: !!process.env.REPLICATE_API_TOKEN,
    time: new Date().toISOString(),
  })
}
