/**
 * NEUTRALIZADO: stub de compatibilidad. La autenticación real vive en
 * /api/auth/* (sesión local MariaDB + alianza Cédula 360). Se conserva
 * la firma createClient() para no romper imports legacy.
 */
export function createClient() {
  const notConfigured = async () => ({
    data: { user: null, session: null, subscription: { unsubscribe() {} } },
    error: { message: 'Auth migrada a Cédula 360 (ver /login)' },
  })
  return {
    auth: {
      getUser: notConfigured,
      getSession: notConfigured,
      signInWithPassword: notConfigured,
      signUp: notConfigured,
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: notConfigured,
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
    },
  }
}
