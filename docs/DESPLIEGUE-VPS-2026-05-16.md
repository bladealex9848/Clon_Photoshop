# Despliegue VPS + Plataforma "Login con Cédula 360" — 2026-05-16

PhotoClone AI (Clon_Photoshop) desplegado en el VPS Hostinger como
plataforma estilo Investep con alianza **Login con Cédula 360**. El editor
de imágenes sigue siendo **público**; la autenticación es aditiva.

## Resumen

| Ítem | Valor |
|------|-------|
| Dominio | `https://photoshop.cedula360.tech` |
| Stack | Next.js 15.5.9 + React 19 + MariaDB |
| App service | `clon-photoshop.service` → `127.0.0.1:3024` |
| Webhook service | `clon-photoshop-webhook.service` → `127.0.0.1:3025` |
| Repo | `bladealex9848/Clon_Photoshop` rama `main` |
| Proyecto | `/root/Clon_Photoshop` |
| BD | MariaDB `clon_photoshop` (usuario `clon_photoshop`@localhost) |
| Secretos | `/root/.clon_photoshop_env` (chmod 600, NO versionado) |
| Logs | `/var/log/clon-photoshop/{app,webhook,build}.log` |

## Arquitectura de autenticación

Reemplaza Supabase (que requería un proyecto externo) por auth local
MariaDB + alianza federada Cédula 360. Mirror del patrón DeepMap.

- `src/lib/auth/db.ts` — pool MySQL (socket UNIX), `ensureSchema()`
  idempotente (tablas `users`, `sessions`), seed admin desde env. bcrypt.
- `src/lib/auth/session.ts` — cookie httponly `clon_ps_session` (30d,
  secure+lax), `currentUser()`, RBAC.
- `src/lib/auth/cedula360.ts` — cliente server-to-server al backend REAL
  `http://localhost:3081` (env `CEDULA360_API_BASE`). **NUNCA :9091**
  (stub que responde 200 sin autenticar). Reenvía la IP real del usuario
  (`X-Forwarded-For`/`X-Real-IP`, primer valor del `x-forwarded-for`
  entrante) en CADA llamada — Cédula 360 limita `/api/auth/*` a 10/min
  por IP. Bypass opcional `CEDULA360_INTERNAL_TOKEN` →
  `x-internal-cron-token`.
- `src/lib/auth/recaptcha.ts` — reCAPTCHA v3 (claves Cédula 360), umbral
  0.3, **fail-open** (nunca tumba el login si Google no responde).

### Endpoints

| Método | Ruta | Función |
|--------|------|---------|
| POST | `/api/auth/login` | login local (email+pass) → cookie |
| POST | `/api/auth/logout` | cierra sesión |
| GET  | `/api/auth/me` | usuario actual |
| GET  | `/api/auth/config` | site key reCAPTCHA, base_url |
| POST | `/api/auth/cedula360/login` | login federado; `{mfa_required}` o sesión |
| POST | `/api/auth/cedula360/challenge` | dispara OTP (`{session_id,method}`) |
| POST | `/api/auth/cedula360/verify` | verifica OTP → upsert local + sesión |
| GET/POST | `/api/admin/users` | listar / crear (admin) |
| PUT/DELETE | `/api/admin/users/[id]` | editar / borrar (admin) |
| GET/PUT | `/api/admin/profile` | perfil propio |
| GET | `/api/admin/sessions` | sesiones propias |

Contrato Cédula 360 (200): `{token,user}` o
`{ok:true,mfa_required:true,session_id,methods,email}`; credenciales
malas → 401 `{error}`. MFA verify → `{ok:true,token,user}`. Métodos:
`totp|email_otp|sms_otp|whatsapp_otp|push|backup_code`.

En éxito federado: upsert por email (rol `viewer`, password inutilizable
aleatoria — nunca se guarda la de Cédula 360, sin escalado), se emite la
sesión local. `mfa_required` → el frontend muestra el paso 2FA inline.
No-200 → se propaga el motivo y el HTTP real (429 sigue 429).

## Operación

```bash
systemctl status clon-photoshop clon-photoshop-webhook
journalctl -u clon-photoshop -f          # o tail /var/log/clon-photoshop/app.log
curl -sI http://127.0.0.1:3024/          # 200 landing pública
```

Auto-deploy: `git push` a `main` → GitHub webhook POST
`https://photoshop.cedula360.tech/webhook` (HMAC SHA256) →
`webhook-clon-photoshop.js` hace `git reset --hard origin/main` +
`npm install` + `npm run build` + `systemctl restart clon-photoshop`.

## Bloque Caddy propuesto (lo aplica el orquestador, NO este repo)

```
photoshop.cedula360.tech {
    encode gzip zstd
    reverse_proxy 127.0.0.1:3024
    handle /webhook {
        reverse_proxy 127.0.0.1:3025
    }
}

# Opcional: 301 desde alexanderoviedofadul.dev
photoshop.alexanderoviedofadul.dev {
    redir https://photoshop.cedula360.tech{uri} permanent
}
```

> Nota: el editor sube imágenes; conviene `request_body { max_size 50MB }`
> en el bloque si el cliente carga imágenes grandes vía API IA.

## Secretos (`/root/.clon_photoshop_env`, chmod 600, NO en git)

`CLON_PS_DB_*`, `CLON_PS_ADMIN_EMAIL/PASSWORD`, `CLON_PS_SESSION_SECRET`,
`CEDULA360_API_BASE` (=`http://localhost:3081`), `CEDULA360_INTERNAL_TOKEN`,
`RECAPTCHA_SITE_KEY/SECRET_KEY/MIN_SCORE`. Cargado por `EnvironmentFile=`
en `clon-photoshop.service`.

## Seguimiento operador

- Añadir `photoshop.cedula360.tech` a la consola reCAPTCHA (mismas claves
  Cédula 360) para que el score sea válido en producción (mientras tanto,
  fail-open lo cubre).
- Credencial admin inicial (`bladealex@gmail.com`): contraseña aleatoria
  en `/root/.clon_photoshop_env` (`CLON_PS_ADMIN_PASSWORD`). Cambiarla
  desde `/admin → Mi perfil` tras el primer acceso.
- Orquestador: añadir el bloque Caddy y emitir TLS.

## Estado — DESPLEGADO Y VALIDADO (2026-05-17)

El build se corrigió (`9463a77`: declaración ambiente para `bcryptjs`,
`tsc` fallaba en `next build`) y la app **está desplegada y sirviendo**:

- Servicios `clon-photoshop` y `clon-photoshop-webhook` **activos**.
- `https://photoshop.cedula360.tech/` → **200**; `/admin` → **200**.
- Alianza con credenciales falsas → **401 real** desde el backend
  Cédula 360 `:3081` (no el stub `:9091`).
- MariaDB `clon_photoshop`: tablas `users`, `sessions` creadas.

## Pendientes

1. **Operador — registrar el webhook de GitHub** apuntando a
   `https://photoshop.cedula360.tech/webhook` (HMAC SHA256). El secreto
   vive **server-side** en el script/entorno del webhook —
   **no se documenta aquí**. Hasta registrarlo, `git push` no dispara
   auto-deploy.
2. **Operador — reCAPTCHA**: añadir `photoshop.cedula360.tech` a los
   dominios de la llave reCAPTCHA de Cédula 360 en la consola de Google
   (mitigado mientras tanto por el fail-open `score 0.3`).
3. **Admin inicial**: `bladealex@gmail.com`; la contraseña vive
   **server-side** en `/root/.clon_photoshop_env`
   (`CLON_PS_ADMIN_PASSWORD`) — **no se documenta aquí**. Cambiarla
   desde `/admin → Mi perfil` tras el primer acceso.
4. **Infra compartida (transversal del ecosistema)**: serializar los
   deploys por webhook / aplicarles nice-cgroup tras el incidente de
   carga del VPS por builds sobre-paralelos (contenido; producción
   saludable).
