# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.3.1] - 2026-05-18

### Agregado — Navegación y sesión en el editor

- **Logo → landing**: el logo "PhotoClone" del TopBar ahora es un enlace
  a `/` (antes no navegaba a ningún sitio).
- **Indicador de sesión** en el TopBar del editor:
  - Sin sesión → botón "Iniciar sesión" (`/login`).
  - Con sesión → avatar + nombre y menú desplegable con datos del usuario
    (nombre, email, rol), enlace al **Panel administrativo** (`/admin`)
    y "Cerrar sesión".
- Resuelve "no se sabe quién inició sesión" y la falta de retorno a la
  landing / acceso al área administrativa desde el editor.

### Validado

- Playwright e2e (anónimo + autenticado): logo navega a la landing,
  "Iniciar sesión" visible sin sesión, panel de cuenta con enlace
  `/admin` y logout con sesión activa.

Detalle: [`docs/EDITOR-FUNCIONAL-COMPLETO-2026-05-17.md`](docs/EDITOR-FUNCIONAL-COMPLETO-2026-05-17.md).

## [0.3.0] - 2026-05-17

### Agregado / Corregido — Editor 100% funcional

- **Bug raíz**: `Toolbar` usaba estado local en vez de `useToolStore` —
  cambiar de herramienta no tenía efecto. Conectado al store (incl.
  selectores de color FG/BG nativos y swap).
- **Stores nuevos**: `useEngineStore` (puente UI↔motor de canvas),
  `useDocumentStore` (tamaño/nombre doc), `useSelectionStore` (selección
  bbox). `lib/canvas/ops.ts` (filtros/transformaciones de píxeles),
  `lib/history.ts` (undo/redo/jump reales sobre estructura de capas).
- **Todos los menús cableados**: Archivo, Editar (copiar/cortar/pegar,
  deshacer/rehacer), Imagen (rotar/voltear/tamaño), Capa (duplicar/
  eliminar/agrupar/desagrupar/fusionar/aplanar), Selección, Filtro
  (blur/sharpen/grayscale/invert), Vista (reglas/guías/cuadrícula con
  overlay real + marca ✓), Ayuda (modales).
- **TopBar**: botón Exportar con menú (PNG/ZIP/.photoclone) + zoom en
  vivo clicable.
- **Paneles**: Propiedades enlazado en vivo (X/Y capa, W/H documento,
  opacidad); Historial real con `jumpToAction`; Capas con "Crear grupo"
  + reordenar drag & drop.
- **CanvasContainer**: registra el motor, tamaño dinámico con
  preservación de píxeles, reglas/guías/cuadrícula reactivas.

### Validado

- **Playwright e2e sobre build de producción: 22/22 verificaciones
  funcionales OK, 0 errores de consola.**

### Limitaciones documentadas

- Historial = estructura de capas (no píxeles de pincel/filtro).
- Selección = bbox rectangular (no máscara freeform).

Detalle: [`docs/EDITOR-FUNCIONAL-COMPLETO-2026-05-17.md`](docs/EDITOR-FUNCIONAL-COMPLETO-2026-05-17.md).

## [0.2.2] - 2026-05-17

### Corregido

- **IA de capas operativa**: `/api/layers/decompose` devolvía `500`
  porque faltaba `REPLICATE_API_TOKEN` en el entorno (la ruta aborta si
  no está). Token configurado server-side; desbloquea también
  `/api/layers/edit`. Corrida real validada: `success:true`, 3 capas en
  7.4 s desde `qwen/qwen-image-layered`.
- **`favicon.ico 404`**: añadido `src/app/icon.svg` (marca "Ps" tema
  Photoshop) — Next.js App Router lo sirve como favicon.
- **Aviso `Canvas2D willReadFrequently`**: `{ willReadFrequently: true }`
  en los 3 contextos que hacen `getImageData` repetido (`LayerEngine`,
  `CompositeRenderer.renderSingleLayer`, `CanvasContainer`). Acelera
  eyedropper/composición sin perder GPU en los contextos de dibujo puro.

### Notas

- **Ollama Cloud descartado para separación de capas**: ningún modelo de
  Ollama Cloud genera imágenes ni hace segmentación/decomposición (son
  LLM/visión-lenguaje, salida solo texto). La vía correcta es Replicate
  (`qwen/qwen-image-layered` / `qwen/qwen-image-edit`).

### Validado

- **Webhook auto-deploy probado end-to-end**: POST firmado HMAC SHA256 →
  `200 {"status":"Deploy iniciado"}` → pipeline completo
  (`git reset --hard` + `npm install` + `npm run build` + restart) en
  ~22 s, servicio `active`, endpoints `200`. Firma inválida → `401`
  correcto. Único pendiente: registrar el webhook en GitHub
  (Settings → Webhooks).

Detalle: [`docs/FIX-IA-DECOMPOSE-Y-EDITOR-2026-05-17.md`](docs/FIX-IA-DECOMPOSE-Y-EDITOR-2026-05-17.md).

## [0.2.1] - 2026-05-17

### Corregido

- **Build**: declaración ambiente para `bcryptjs` (`9463a77`) — `tsc`
  fallaba en `next build`. Con el fix el build completa y la app
  despliega.

### Validado — DESPLEGADO Y SIRVIENDO

- Servicios `clon-photoshop` y `clon-photoshop-webhook` **activos**.
- `https://photoshop.cedula360.tech/` → **200**; `/admin` → **200**.
- Alianza con credenciales falsas → **401 real** desde el backend
  Cédula 360 `:3081` (no el stub `:9091`).
- MariaDB `clon_photoshop`: tablas `users`, `sessions` creadas.

### Pendientes

- **Operador — registrar el webhook de GitHub**
  (`https://photoshop.cedula360.tech/webhook`, HMAC SHA256). El secreto
  vive server-side en el script/entorno del webhook — **no documentado
  aquí**. Hasta registrarlo, `git push` no dispara auto-deploy.
- **Operador — reCAPTCHA**: añadir `photoshop.cedula360.tech` a los
  dominios de la llave reCAPTCHA de Cédula 360 en la consola de Google
  (mitigado por fail-open `0.3`).
- **Admin inicial** `bladealex@gmail.com`; contraseña server-side en
  `/root/.clon_photoshop_env` (no documentada). Cambiar tras 1er acceso.
- **Infra compartida (transversal)**: serializar deploys por webhook /
  nice-cgroup tras el incidente de carga del VPS (contenido; producción
  saludable).

Detalle: [`docs/DESPLIEGUE-VPS-2026-05-16.md`](docs/DESPLIEGUE-VPS-2026-05-16.md).

## [0.2.0] - 2026-05-16

### Agregado — Plataforma + alianza "Login con Cédula 360"

- **Autenticación local MariaDB** (reemplaza Supabase): tablas `users` y
  `sessions` creadas idempotentemente vía `ensureSchema()`; bcrypt; cookie
  de sesión httponly `clon_ps_session` (30 días, secure+lax).
- **API routes Next.js** (`runtime=nodejs`, `force-dynamic`):
  - `/api/auth/{login,logout,me,config}` — login local + sesión.
  - `/api/auth/cedula360/{login,challenge,verify}` — alianza Cédula 360
    server-to-server contra el backend REAL `http://localhost:3081`
    (NUNCA :9091). Reenvío de IP real (`X-Forwarded-For`/`X-Real-IP`) en
    cada llamada por el rate-limit 10/min por IP. Soporta MFA inline
    (`totp|email_otp|sms_otp|whatsapp_otp|push|backup_code`).
  - `/api/admin/{users,users/[id],profile,sessions}` — CRUD usuarios
    (RBAC admin), perfil propio, sesiones.
- **reCAPTCHA v3** (claves Cédula 360, umbral 0.3, fail-open) en logins.
- **Panel `/admin`**: SPA con tabs Usuarios (admin), Mi perfil, Sesiones.
- **Login** con botón "Continuar con Cédula 360" + 2FA inline; el editor
  permanece **público** (transformación aditiva, sin gating del editor).
- **Marca de alianza**: footer/landing "en alianza con Cédula 360" +
  enlace cedula360.tech + contacto info@cedula360.tech.
- Despliegue VPS: `clon-photoshop.service` (Next.js, 127.0.0.1:3024) +
  `clon-photoshop-webhook.service` (auto-deploy GitHub, 127.0.0.1:3025).
  Doc: `docs/DESPLIEGUE-VPS-2026-05-16.md`.

### Cambiado

- Supabase neutralizado a stubs de compatibilidad (sin OAuth). `middleware`
  ya no fuerza login en `/editor`; sólo redirige sesiones a `/admin`.
- Registro abierto retirado: acceso vía Cédula 360 o credenciales emitidas
  por un administrador.

Detalle: [`docs/DESPLIEGUE-VPS-2026-05-16.md`](docs/DESPLIEGUE-VPS-2026-05-16.md).

## [0.1.0] - 2025-12-28

### Agregado

#### Core
- Setup inicial del proyecto con Next.js 15.5.9 y React 19
- Configuración de Tailwind CSS con tema oscuro estilo Photoshop
- Sistema de tipos TypeScript completo para capas, herramientas y editor
- Constantes centralizadas para herramientas, blend modes y atajos

#### Autenticación
- Integración completa con Supabase Auth
- Login/registro con email y contraseña
- OAuth con Google y GitHub
- Middleware de protección de rutas
- Callback handler para OAuth

#### Editor
- Layout de 4 zonas: TopBar, Toolbar, Canvas, RightPanel
- TopBar con menús desplegables (Archivo, Editar, Imagen, Capa, Selección, Filtro, Vista, Ayuda)
- Toolbar con 10 herramientas y selector de colores
- Canvas con zoom, pan y reglas
- RightPanel con pestañas para Capas e IA

#### Motor Canvas
- LayerEngine para gestión de OffscreenCanvas por capa
- CompositeRenderer para composición con blend modes
- Soporte para 16 modos de mezcla (normal, multiply, screen, overlay, etc.)

#### Herramientas
- Pincel (brush) con tamaño, dureza, opacidad y flujo
- Borrador (eraser) con configuración similar al pincel
- Mover (move) para desplazar capas
- Cuentagotas (eyedropper) para seleccionar colores
- Texto (text) para añadir texto
- Selección rectangular (selection)
- Zoom para acercar/alejar
- Mano (hand) para pan del canvas
- Recortar (crop) para recortar imagen
- Lazo (lasso) para selección libre

#### Estado (Zustand)
- useLayerStore: gestión de capas, orden, visibilidad, opacidad, blend modes
- useToolStore: herramienta activa, configuraciones, colores primario/secundario
- useViewStore: zoom, pan, guías, reglas, cuadrícula
- useHistoryStore: undo/redo con snapshots
- useAIStore: estado de descomposición IA

#### Panel de Capas
- Lista de capas con miniaturas
- Toggle de visibilidad y bloqueo
- Control de opacidad por capa
- Selector de blend mode
- Reordenamiento drag & drop
- Botones para nueva capa y eliminar

#### Historial
- Sistema completo de undo/redo
- Snapshots del estado de capas
- Límite configurable de historial

#### Atajos de Teclado
- Hook useKeyboardShortcuts
- Soporte para herramientas (V, B, E, T, Z, etc.)
- Soporte para acciones (Ctrl+Z, Ctrl+S, etc.)
- Soporte para zoom (Ctrl++, Ctrl+-)

#### Integración IA
- API route `/api/layers/decompose`
- Integración con Replicate (qwen/qwen-image-layered)
- Panel de IA con upload de imagen
- Selector de cantidad de capas
- Campo de instrucciones opcional

#### Exportación
- PNGExporter: exportar canvas a PNG
- ZIPExporter: exportar capas como PNGs en ZIP
- ProjectExporter: formato .photoclone (JSON + imágenes)
- Importación de proyectos .photoclone

#### UI/UX
- Tema oscuro consistente con Photoshop
- Iconos Material Symbols Outlined
- Menús desplegables con atajos visibles
- Barra de estado con información del documento
- Landing page con hero y features

### Técnico
- TypeScript strict mode
- ESLint configurado
- Build optimizado para producción
- Compatibilidad con VPS (Next.js 15.5.9)
