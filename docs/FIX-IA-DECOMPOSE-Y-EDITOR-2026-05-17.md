# Fix IA (decompose/edit) + saneo editor — 2026-05-17

Resolución del `500` en `/api/layers/decompose`, análisis de Ollama Cloud
como alternativa, y limpieza de los avisos de consola del editor.

## Síntomas reportados (consola de `/editor`)

1. `favicon.ico:1 Failed to load resource: 404`
2. `Canvas2D: Multiple readback operations using getImageData are faster
   with the willReadFrequently attribute set to true` (en bucle)
3. `POST /api/layers/decompose 500 (Internal Server Error)`

## Causa raíz del `500`

**No era el modelo.** `src/app/api/layers/decompose/route.ts` (y
`.../edit/route.ts`) usan Replicate y abortan de inmediato si falta el
token:

```ts
if (!process.env.REPLICATE_API_TOKEN) {
  return NextResponse.json({ success:false, error:'API token not configured' }, { status:500 })
}
```

`/root/.clon_photoshop_env` **no tenía `REPLICATE_API_TOKEN`**. POST
reproducido en producción → `500`.

## ¿Ollama Cloud podía reemplazarlo? — No

Pregunta evaluada: usar un modelo de Ollama Cloud para la separación de
capas en lugar de Replicate.

**Conclusión: no existe modelo en Ollama Cloud capaz de esto, ni una
"API" del modelo para ello.**

- `qwen/qwen-image-layered` es un modelo de **difusión que genera
  imágenes** (1 imagen → N PNG/WebP RGBA). Familia *Qwen-Image* de
  Alibaba.
- Los modelos "Qwen" de Ollama Cloud (`qwen3.5`, etc.) son **LLM /
  visión-lenguaje**: entrada texto (+imagen como *input* en VLM) →
  salida **solo texto**. Misma marca, clase de modelo distinta.
- Catálogo completo de `ollama.com/search?c=cloud` revisado
  (deepseek-v4, kimi-k2.6, gemma4, qwen3.5, glm-5, minimax, nemotron,
  devstral…): **ninguno genera imágenes ni hace
  segmentación/decomposición de capas**. "Vision" = *entender* la
  imagen, no *producirla*. Ollama no sirve modelos de salida-imagen.

Por tanto la vía correcta es **mantener Replicate**
(`qwen/qwen-image-layered` para decompose, `qwen/qwen-image-edit` para
edit). Ollama Cloud solo serviría, de forma complementaria, para
*describir/etiquetar* capas (texto) — no para el recorte de píxeles.

## Cambios aplicados

| Cambio | Archivo | Detalle |
|---|---|---|
| Token IA | `/root/.clon_photoshop_env` | `REPLICATE_API_TOKEN` añadido (backup `.bak.<ts>`, chmod 600, NO en git). Desbloquea `decompose` **y** `edit` |
| Favicon | `src/app/icon.svg` (nuevo) | SVG marca "Ps" tema Photoshop. Next.js App Router lo sirve como favicon → fin del `404` |
| Perf canvas | `src/lib/canvas/LayerEngine.ts` | `getContext('2d', { willReadFrequently: true })` (el ctx cacheado con `getImageData` repetido) |
| Perf canvas | `src/lib/canvas/CompositeRenderer.ts` | idem en `renderSingleLayer()` |
| Perf canvas | `src/components/editor/Canvas/CanvasContainer.tsx` | idem en el check de capa vacía |

`willReadFrequently` se aplicó **solo** en los 3 contextos que hacen
`getImageData`; los contextos de dibujo puro (composición/display) se
dejan sin el flag para conservar aceleración GPU.

## Validación end-to-end (probado al 100%)

| Verificación | Resultado |
|---|---|
| Rebuild `nice -15` + `systemctl restart clon-photoshop` | EXIT=0, `active` |
| `/`, `/editor`, `/admin`, `/login` (prod) | **200** |
| `/icon.svg` | **200** `image/svg+xml` |
| `decompose` gate token | `500` → `400` ("Image is required") |
| **`decompose` corrida REAL** (imagen sintética 320×320) | `success:true`, **3 capas**, **7.4 s**, URLs `replicate.delivery` |
| Login admin `bladealex@gmail.com` | `HTTP 200`, sesión `role:admin` vía `/api/auth/me` |

## Pendiente operador

- **Consolidación git**: estos cambios de código se commitearon y
  pushearon a `main` (este doc incluido). El webhook hace
  `git reset --hard origin/main`; con el push ya no hay riesgo de
  revertir los fixes en un deploy futuro.
- El token Replicate vive en el env (fuera de git, persistente).
- Recomendado: rotar la contraseña admin inicial desde
  `/admin → Mi perfil` (estaba en `/root/.clon_photoshop_env`).
