# API pública v1 — PhotoClone AI

Servicio HTTP consumible por otros proyectos (ej. Cédula 360) que expone
las capacidades del editor: separación de imágenes en capas con IA,
edición de imágenes por texto y operaciones raster server-side.

- **Base**: `https://photoshop.cedula360.tech/api/v1`
- **Auth**: `Authorization: Bearer <API_KEY>` o cabecera `X-API-Key: <API_KEY>`
- **CORS**: habilitado (`*`) — usable desde navegador o servidor.
- **Formato de error**: `{ "ok": false, "error": "...", "code": "eNNN" }`
  - `401` falta/clave inválida · `403` scope/clave revocada ·
    `429` rate-limit o cuota mensual · `400` body inválido ·
    `502` error de la IA.

Las API keys las emiten **administradores** desde
`https://photoshop.cedula360.tech/admin` → pestaña **API Keys**. La clave
en claro se muestra **una sola vez**; en BD solo se guarda su SHA-256.
Cada clave tiene scopes, rate-limit por minuto y cuota mensual opcional.

## Endpoints

| Método | Ruta | Scope | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | — | Estado del servicio |
| GET | `/api/v1/capabilities` | — | Auto-descripción (este contrato en JSON) |
| GET | `/api/v1/usage` | — | Uso y límites de tu API key |
| POST | `/api/v1/decompose` | `decompose` | Imagen → N capas RGBA (IA `qwen-image-layered`) |
| POST | `/api/v1/edit` | `edit` | Edita imagen con prompt (IA `qwen-image-edit`) |
| POST | `/api/v1/transform` | `transform` | Ops raster server-side (sharp) |

### POST /api/v1/decompose

```jsonc
// body
{
  "image": "https://… | data:image/png;base64,… | <base64>",  // requerido
  "layerCount": 4,                 // 2-10 (def 4)
  "instructions": "separar fondo, personaje, texto",  // opcional
  "outputFormat": "webp",          // webp|png (def webp)
  "outputQuality": 95              // 1-100
}
// 200
{ "ok": true,
  "layers": [ { "name": "Capa 1", "imageUrl": "https://replicate.delivery/…", "order": 0 }, … ],
  "processingTimeMs": 7968 }
```

### POST /api/v1/edit

```jsonc
{ "image": "url|dataURI|base64", "prompt": "convierte el fondo en azul",
  "guidance": 4, "strength": 0.9, "numInferenceSteps": 50, "aspectRatio": "16:9" }
// 200 → { "ok": true, "editedImageUrl": "https://…", "processingTimeMs": 5400 }
```

### POST /api/v1/transform (sharp, sin coste IA)

```jsonc
{ "image": "url|dataURI|base64",
  "ops": [
    { "type": "resize", "width": 800, "height": null, "fit": "inside" },
    { "type": "rotate", "angle": 90 },
    { "type": "flip" }, { "type": "flop" },
    { "type": "grayscale" }, { "type": "negate" },
    { "type": "blur", "sigma": 3 }, { "type": "sharpen", "sigma": 1 },
    { "type": "tint", "color": "#0078d4" },
    { "type": "extend", "top": 10, "bottom": 10, "left": 10, "right": 10, "background": "#00000000" }
  ],
  "format": "png",          // png|jpeg|webp (def png)
  "return": "datauri"       // datauri|base64 (def datauri)
}
// 200 → { "ok": true, "image": "data:image/png;base64,…", "format":"png", "width":800, "height":600, "bytes": 12345 }
```

### GET /api/v1/usage

```json
{ "ok": true, "key": { "owner": "...", "scopes": [...],
  "rate_per_min": 120, "monthly_quota": null,
  "used_total": 2, "used_month": 2, "month": "2026-05", "active": true } }
```

## Ejemplos

```bash
KEY="ck_live_xxxxxxxx"
# Separar en capas
curl -s -X POST https://photoshop.cedula360.tech/api/v1/decompose \
  -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"image":"https://misitio.com/foto.jpg","layerCount":4}'

# Transformar (sin IA)
curl -s -X POST https://photoshop.cedula360.tech/api/v1/transform \
  -H "X-API-Key: $KEY" -H 'Content-Type: application/json' \
  -d '{"image":"https://misitio.com/foto.jpg","ops":[{"type":"grayscale"},{"type":"resize","width":512}],"format":"webp"}'
```

```js
// Node / navegador
const r = await fetch('https://photoshop.cedula360.tech/api/v1/decompose', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.PHOTOCLONE_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ image: imageUrl, layerCount: 4 }),
})
const data = await r.json()
if (!data.ok) throw new Error(data.error)
data.layers.forEach(l => console.log(l.name, l.imageUrl))
```

## Arquitectura

- `src/lib/api/keys.ts` — tabla `api_keys` (SHA-256, scopes, rate-limit
  en memoria 60s, cuota mensual), `verifyApiKey`, `recordUsage`.
- `src/lib/api/respond.ts` — CORS + helpers.
- `src/lib/ai/replicate.ts` — núcleo IA reutilizable.
- `src/app/api/v1/*` — endpoints públicos.
- `src/app/api/admin/api-keys/*` — gestión (RBAC admin).
- `/admin` → pestaña **API Keys** (crear/listar/revocar).

## Operación

- Crear clave: `/admin` (admin) → API Keys → completar formulario →
  copiar la clave mostrada (única vez).
- Revocar: botón "Revocar" en la tabla (las peticiones devuelven 403).
- La clave NO es recuperable: si se pierde, revóquela y emita otra.
