/**
 * NEUTRALIZADO: stub de compatibilidad server-side. La autenticación real
 * vive en /api/auth/* (sesión local MariaDB + alianza Cédula 360).
 */
export async function createClient() {
  const noop = async () => ({ data: { user: null, session: null }, error: null })
  return {
    auth: {
      getUser: noop,
      getSession: noop,
      exchangeCodeForSession: noop,
      signOut: async () => ({ error: null }),
    },
  }
}
