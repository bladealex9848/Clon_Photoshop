/** Helpers de respuesta + CORS para el API público v1. */
import { NextResponse } from 'next/server'

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
}

export function json(data: any, status = 200, extra?: Record<string, string>) {
  return NextResponse.json(data, { status, headers: { ...CORS, ...(extra || {}) } })
}

export function apiError(status: number, message: string, code?: string) {
  return json({ ok: false, error: message, code: code || `e${status}` }, status)
}

export function preflight() {
  return new NextResponse(null, { status: 204, headers: CORS })
}
