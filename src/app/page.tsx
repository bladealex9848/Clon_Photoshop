import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <header className="border-b border-editor-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-editor-accent text-3xl">layers</span>
            <span className="text-xl font-bold text-editor-text-bright">PhotoClone AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-editor-text hover:text-editor-text-bright transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="btn btn-primary">
              Comenzar Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-editor-text-bright mb-6">
            Edición Profesional de Imágenes
            <span className="block text-editor-accent">con Inteligencia Artificial</span>
          </h1>
          <p className="text-xl text-editor-text-muted max-w-3xl mx-auto mb-10">
            Separa automáticamente tus imágenes en capas editables usando IA avanzada.
            Interfaz tipo Photoshop, completamente en tu navegador.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn btn-primary text-lg px-8 py-3">
              Probar Ahora
            </Link>
            <Link href="/editor" className="btn btn-secondary text-lg px-8 py-3">
              Ver Demo
            </Link>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-16 relative">
          <div className="bg-editor-surface rounded-xl border border-editor-border p-2 shadow-2xl">
            <div className="aspect-video bg-editor-bg rounded-lg flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-editor-accent mb-4">auto_awesome</span>
                <p className="text-editor-text-muted">Vista previa del editor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-editor-text-bright mb-12">
          Características Principales
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-editor-surface rounded-xl p-6 border border-editor-border">
            <div className="w-12 h-12 bg-editor-active rounded-lg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-editor-accent">layers</span>
            </div>
            <h3 className="text-xl font-semibold text-editor-text-bright mb-2">
              Sistema de Capas Avanzado
            </h3>
            <p className="text-editor-text-muted">
              Gestiona capas con drag-and-drop, grupos, modos de fusión y opacidad individual.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-editor-surface rounded-xl p-6 border border-editor-border">
            <div className="w-12 h-12 bg-editor-active rounded-lg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-editor-accent">auto_awesome</span>
            </div>
            <h3 className="text-xl font-semibold text-editor-text-bright mb-2">
              Separación IA en Capas
            </h3>
            <p className="text-editor-text-muted">
              Divide automáticamente cualquier imagen en capas RGBA independientes usando IA.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-editor-surface rounded-xl p-6 border border-editor-border">
            <div className="w-12 h-12 bg-editor-active rounded-lg flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-editor-accent">brush</span>
            </div>
            <h3 className="text-xl font-semibold text-editor-text-bright mb-2">
              Herramientas Profesionales
            </h3>
            <p className="text-editor-text-muted">
              Pincel, borrador, selección, texto, recorte y más. Con atajos de teclado.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-editor-active to-editor-accent rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comienza a Editar Hoy
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            No necesitas descargar nada. Accede desde cualquier navegador y comienza a crear.
          </p>
          <Link href="/register" className="bg-white text-editor-accent font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block">
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-editor-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-editor-text-muted">
          <p>&copy; 2024 PhotoClone AI. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
