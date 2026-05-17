/**
 * NEUTRALIZADO: OAuth de Supabase retirado. La autenticación se realiza
 * vía /api/auth/* (local + alianza Cédula 360). Cualquier acceso a este
 * callback redirige al login.
 */
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/login`)
}
