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
    auth: 'Authorization: Bearer <API_KEY>  (o cabecera X-API-Key)',
    base: '/api/v1',
    endpoints: [
      { method: 'GET', path: '/api/v1/health', scope: null, desc: 'Estado del servicio' },
      { method: 'GET', path: '/api/v1/capabilities', scope: null, desc: 'Este documento' },
      { method: 'GET', path: '/api/v1/usage', scope: 'cualquiera', desc: 'Uso y límites de tu API key' },
      {
        method: 'POST', path: '/api/v1/decompose', scope: 'decompose',
        desc: 'Separa una imagen en N capas RGBA con IA (qwen-image-layered)',
        body: { image: 'url|dataURI|base64 (requerido)', layerCount: '2-10 (def 4)', instructions: 'string opcional', outputFormat: 'webp|png', outputQuality: '1-100' },
        returns: { layers: '[{name,imageUrl,order}]', processingTimeMs: 'number' },
      },
      {
        method: 'POST', path: '/api/v1/edit', scope: 'edit',
        desc: 'Edita una imagen/capa con instrucción de texto (qwen-image-edit)',
        body: { image: 'url|dataURI|base64 (requerido)', prompt: 'string (requerido)', guidance: 'num', strength: '0-1', numInferenceSteps: 'num', aspectRatio: 'ej 16:9' },
        returns: { editedImageUrl: 'string', processingTimeMs: 'number' },
      },
      {
        method: 'POST', path: '/api/v1/transform', scope: 'transform',
        desc: 'Operaciones raster server-side (sharp): resize, rotate, flip, flop, grayscale, negate, blur, sharpen, tint, format',
        body: {
          image: 'url|dataURI|base64 (requerido)',
          ops: '[{type:"resize",width,height}|{type:"rotate",angle}|{type:"flip"}|{type:"flop"}|{type:"grayscale"}|{type:"negate"}|{type:"blur",sigma}|{type:"sharpen"}|{type:"tint",color}]',
          format: 'png|jpeg|webp (def png)',
          return: 'datauri|base64 (def datauri)',
        },
        returns: { image: 'dataURI|base64', format: 'string', width: 'num', height: 'num' },
      },
    ],
    errors: '{ ok:false, error, code }  · 401 sin/clave inválida · 403 scope/revocada · 429 rate/cuota',
  })
}
