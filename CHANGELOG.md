# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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
