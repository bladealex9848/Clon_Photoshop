/**
 * Capa de persistencia MariaDB para el subsistema de autenticación de
 * Clon_Photoshop (alianza "Login con Cédula 360", estilo Investep/DeepMap).
 *
 * - Credenciales desde el EnvironmentFile NO versionado /root/.clon_photoshop_env
 *   (cargado por el drop-in systemd) o variables de entorno equivalentes.
 * - ensureSchema() crea las tablas si no existen (idempotente, sin SQL manual)
 *   y siembra el admin inicial.
 *
 * Aditivo: el editor de imágenes sigue siendo público y funcional sin BD.
 * Si MariaDB no está disponible, las rutas admin devuelven 503 controlado.
 */
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { existsSync } from 'fs'

let _pool: mysql.Pool | null = null
let _schemaDone = false

function dbConfig(): mysql.PoolOptions {
  const socket = process.env.CLON_PS_DB_SOCKET || '/run/mysqld/mysqld.sock'
  const base: mysql.PoolOptions = {
    user: process.env.CLON_PS_DB_USER || 'clon_photoshop',
    password: process.env.CLON_PS_DB_PASSWORD || '',
    database: process.env.CLON_PS_DB_NAME || 'clon_photoshop',
    charset: 'utf8mb4',
    connectionLimit: 5,
    waitForConnections: true,
  }
  // Preferir socket UNIX local; fallback a TCP.
  try {
    const fs = require('fs')
    if (socket && fs.existsSync(socket)) {
      return { ...base, socketPath: socket }
    }
  } catch {
    /* noop */
  }
  return {
    ...base,
    host: process.env.CLON_PS_DB_HOST || '127.0.0.1',
    port: parseInt(process.env.CLON_PS_DB_PORT || '3306', 10),
  }
}

export function pool(): mysql.Pool {
  if (!_pool) _pool = mysql.createPool(dbConfig())
  return _pool
}

const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL DEFAULT '',
     role ENUM('admin','viewer') NOT NULL DEFAULT 'viewer',
     active TINYINT(1) NOT NULL DEFAULT 1,
     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     last_login_at DATETIME NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token VARCHAR(64) PRIMARY KEY,
     user_id INT NOT NULL,
     created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     expires_at DATETIME NOT NULL,
     user_agent VARCHAR(512) NULL,
     ip VARCHAR(64) NULL,
     CONSTRAINT fk_ps_sessions_user FOREIGN KEY (user_id)
       REFERENCES users(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
]

export async function ensureSchema(): Promise<void> {
  if (_schemaDone) return
  const p = pool()
  for (const stmt of SCHEMA_SQL) {
    await p.query(stmt)
  }
  await seedAdmin()
  _schemaDone = true
}

async function seedAdmin(): Promise<void> {
  const email = (process.env.CLON_PS_ADMIN_EMAIL || 'bladealex@gmail.com').trim().toLowerCase()
  const password = (process.env.CLON_PS_ADMIN_PASSWORD || '').trim()
  if (!password) return
  const existing = await fetchOne<{ id: number }>(
    'SELECT id FROM users WHERE email=?',
    [email]
  )
  if (existing) return
  await execute(
    "INSERT INTO users (email, password_hash, name, role, active) VALUES (?,?,?,'admin',1)",
    [email, await hashPassword(password), 'Administrador']
  )
}

// ---- helpers de acceso ----

export async function fetchOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const [rows] = await pool().query(sql, params)
  const arr = rows as any[]
  return arr.length ? (arr[0] as T) : null
}

export async function fetchAll<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const [rows] = await pool().query(sql, params)
  return rows as T[]
}

export async function execute(sql: string, params: any[] = []): Promise<number> {
  const [res] = await pool().query(sql, params)
  return (res as any).insertId || 0
}

// ---- seguridad ----

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  if (!plain || !hashed) return false
  try {
    return await bcrypt.compare(plain, hashed)
  } catch {
    return false
  }
}

export function newSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function unusablePassword(): Promise<string> {
  // Hash de una contraseña aleatoria imposible de adivinar (logins federados).
  return hashPassword(crypto.randomBytes(48).toString('base64url'))
}
