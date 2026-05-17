import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    recaptcha_site_key:
      process.env.RECAPTCHA_SITE_KEY ||
      '6Ldufr4sAAAAAEX6uLIrV3Uk4auM7zksyUvdeA-k',
    cedula360_alliance: true,
    base_url:
      process.env.CLON_PS_BASE_URL || 'https://photoshop.cedula360.tech',
  })
}
