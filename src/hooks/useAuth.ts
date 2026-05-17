'use client'

import { useEffect, useState } from 'react'

export interface AuthUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'viewer'
  active: boolean
}

/**
 * Hook de sesión local (MariaDB) + alianza Cédula 360.
 * Reemplaza al hook de Supabase. El editor es público; este hook sólo
 * refleja si hay una cuenta autenticada (para /admin y la UI).
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) {
          setUser(d?.user ?? null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) {
          setUser(null)
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [])

  const signOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    window.location.href = '/'
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  }
}
