import Link from 'next/link'

export const metadata = {
  title: 'PhotoClone AI — Editor de imágenes con IA y capas en el navegador',
  description:
    'Separa cualquier imagen en capas editables con IA, edítalas con instrucciones de texto y trabaja con herramientas tipo Photoshop. Sin instalar nada.',
}

/* ---------- Mockup fiel del editor (reemplaza el placeholder vacío) ---------- */
function EditorPreview() {
  const tools = [
    'open_with', 'select_all', 'lasso_select', 'brush', 'ink_eraser',
    'text_fields', 'crop', 'colorize', 'zoom_in', 'pan_tool',
  ]
  const layers = [
    { name: 'Texto / Logo', c: 'from-amber-300 to-amber-500', ic: 'text_fields' },
    { name: 'Personaje', c: 'from-sky-400 to-indigo-500', ic: 'person' },
    { name: 'Fondo', c: 'from-emerald-400 to-teal-600', ic: 'wallpaper' },
  ]
  return (
    <div className="bg-editor-surface rounded-xl border border-editor-border shadow-2xl overflow-hidden ring-1 ring-white/5">
      {/* Top bar */}
      <div className="h-9 bg-editor-surface border-b border-editor-border flex items-center px-3 gap-3 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-editor-accent text-sm">layers</span>
          <span className="font-semibold text-editor-text-bright">PhotoClone</span>
        </div>
        <div className="hidden sm:flex gap-3 text-editor-text-muted">
          {['Archivo', 'Editar', 'Imagen', 'Capa', 'Filtro', 'Vista'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-editor-text-muted">100%</span>
          <span className="px-2 py-0.5 rounded bg-editor-accent text-white">Exportar</span>
        </div>
      </div>

      <div className="flex h-[260px] sm:h-[340px]">
        {/* Toolbar */}
        <div className="w-9 bg-editor-surface border-r border-editor-border flex flex-col items-center py-2 gap-1.5">
          {tools.map((t, i) => (
            <span
              key={t}
              className={`material-symbols-outlined text-base p-1 rounded ${
                i === 3 ? 'bg-editor-active text-editor-accent' : 'text-editor-text-muted'
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Canvas con composición de ejemplo */}
        <div className="flex-1 bg-editor-bg flex items-center justify-center p-4 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="relative w-full max-w-sm aspect-[4/3] rounded-lg shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600" />
            <div className="absolute -bottom-6 -right-4 w-40 h-40 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 blur-[1px]" />
            <div className="absolute left-5 top-5 px-3 py-1 rounded-md bg-amber-400 text-[10px] font-bold text-amber-950 shadow">
              PhotoClone AI
            </div>
            <div className="absolute bottom-3 left-4 text-[10px] text-white/80">
              3 capas separadas por IA
            </div>
          </div>
        </div>

        {/* Layers panel */}
        <div className="w-36 sm:w-44 bg-editor-surface border-l border-editor-border flex flex-col">
          <div className="flex border-b border-editor-border text-[10px]">
            {['Capas', 'IA', 'Hist.'].map((t, i) => (
              <div
                key={t}
                className={`flex-1 text-center py-1.5 ${
                  i === 0
                    ? 'text-editor-text-bright border-b-2 border-editor-accent'
                    : 'text-editor-text-muted'
                }`}
              >
                {t}
              </div>
            ))}
          </div>
          <div className="p-1.5 space-y-1">
            {layers.map((l) => (
              <div
                key={l.name}
                className="flex items-center gap-2 p-1.5 rounded bg-editor-bg/60 border border-editor-border/50"
              >
                <span className="material-symbols-outlined text-[13px] text-editor-text-muted">
                  visibility
                </span>
                <div className={`w-6 h-6 rounded bg-gradient-to-br ${l.c}`} />
                <span className="text-[10px] text-editor-text truncate flex-1">{l.name}</span>
                <span className="material-symbols-outlined text-[13px] text-indigo-400">
                  auto_fix_high
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto p-2 border-t border-editor-border flex justify-center gap-2 text-editor-text-muted">
            {['add', 'create_new_folder', 'content_copy', 'delete'].map((i) => (
              <span key={i} className="material-symbols-outlined text-sm">{i}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { ic: 'auto_awesome', t: 'Separación en capas con IA', d: 'Sube una imagen y la IA (qwen-image-layered) la divide en capas RGBA independientes — fondo, personajes, texto, objetos.' },
  { ic: 'auto_fix_high', t: 'Edición de capa por texto', d: 'Modifica cualquier capa describiendo el cambio en lenguaje natural con qwen-image-edit.' },
  { ic: 'layers', t: 'Sistema de capas pro', d: 'Drag & drop, grupos, 16 modos de fusión, opacidad por capa, fusionar y aplanar.' },
  { ic: 'tune', t: 'Filtros y transformaciones', d: 'Invertir, escala de grises, desenfocar, enfocar, rotar 90°, voltear y escalar.' },
  { ic: 'brush', t: 'Herramientas + atajos', d: 'Pincel, borrador, mover, cuentagotas, texto, selección, lazo, recorte, zoom y mano.' },
  { ic: 'download', t: 'Exporta donde quieras', d: 'PNG plano, ZIP con todas las capas o proyecto .photoclone reeditable.' },
]

const STEPS = [
  { n: '1', ic: 'upload', t: 'Sube tu imagen', d: 'Arrástrala al lienzo o ábrela desde el menú. Sin instalar nada, todo en el navegador.' },
  { n: '2', ic: 'auto_awesome', t: 'La IA la separa en capas', d: 'En segundos obtienes capas editables independientes listas para trabajar.' },
  { n: '3', ic: 'ios_share', t: 'Edita y exporta', d: 'Retoca con herramientas y filtros, edita capas con IA y exporta en el formato que necesites.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-editor-bg text-editor-text">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-editor-border bg-editor-bg/85 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-editor-accent text-3xl">layers</span>
            <span className="text-xl font-bold text-editor-text-bright">PhotoClone AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-editor-text-bright transition-colors">Características</a>
            <a href="#como" className="hover:text-editor-text-bright transition-colors">Cómo funciona</a>
            <a href="#preview" className="hover:text-editor-text-bright transition-colors">El editor</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline text-sm hover:text-editor-text-bright transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/editor" className="btn btn-primary">Abrir editor</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-editor-accent/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-editor-border bg-editor-surface text-xs text-editor-text-muted mb-6">
              <span className="material-symbols-outlined text-sm text-editor-accent">bolt</span>
              Editor de imágenes con IA · 100% en el navegador
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold text-editor-text-bright mb-6 leading-tight">
              Convierte una imagen plana en
              <span className="block text-editor-accent">capas editables con IA</span>
            </h1>
            <p className="text-lg sm:text-xl text-editor-text-muted max-w-2xl mx-auto mb-8">
              PhotoClone AI separa automáticamente tu imagen en capas RGBA, te deja
              editar cada una con instrucciones de texto y darle el acabado con
              herramientas y filtros tipo Photoshop. Sin descargar nada.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <Link href="/editor" className="btn btn-primary text-lg px-8 py-3">
                Probar gratis ahora
              </Link>
              <a href="#preview" className="btn btn-secondary text-lg px-8 py-3">
                Ver el editor
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-editor-text-muted">
              {['Sin instalación', 'Editor público y gratuito', 'Capas RGBA reales', 'Exporta PNG / ZIP / proyecto'].map((b) => (
                <span key={b} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-editor-success">check_circle</span>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div id="preview" className="mt-14 scroll-mt-24">
            <EditorPreview />
            <p className="text-center text-xs text-editor-text-muted mt-3">
              Interfaz real del editor: barra de herramientas, lienzo multicapa y panel de capas con edición IA.
            </p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <h2 className="text-3xl font-bold text-center text-editor-text-bright mb-3">Cómo funciona</h2>
        <p className="text-center text-editor-text-muted mb-12">Tres pasos, sin curva de aprendizaje.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="relative bg-editor-surface rounded-xl p-6 border border-editor-border">
              <span className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-editor-accent text-white font-bold flex items-center justify-center shadow-lg">
                {s.n}
              </span>
              <span className="material-symbols-outlined text-editor-accent text-3xl mb-3 block">{s.ic}</span>
              <h3 className="text-lg font-semibold text-editor-text-bright mb-2">{s.t}</h3>
              <p className="text-editor-text-muted text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <h2 className="text-3xl font-bold text-center text-editor-text-bright mb-3">Todo lo que puedes hacer</h2>
        <p className="text-center text-editor-text-muted mb-12">Un editor completo, no solo una demo.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.t} className="bg-editor-surface rounded-xl p-6 border border-editor-border hover:border-editor-accent/60 transition-colors">
              <div className="w-12 h-12 bg-editor-active rounded-lg flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-editor-accent">{f.ic}</span>
              </div>
              <h3 className="text-lg font-semibold text-editor-text-bright mb-2">{f.t}</h3>
              <p className="text-editor-text-muted text-sm">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-editor-active to-editor-accent rounded-2xl p-12 text-center relative overflow-hidden">
          <h2 className="text-3xl font-bold text-white mb-4">Empieza a editar ahora</h2>
          <p className="text-white/85 mb-8 max-w-2xl mx-auto">
            El editor es público y gratuito. Crea una cuenta con Cédula 360 solo si
            quieres administrar usuarios o tu perfil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/editor" className="bg-white text-editor-accent font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Abrir el editor
            </Link>
            <Link href="/login" className="border border-white/60 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Continuar con Cédula 360
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-editor-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-editor-text-muted">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-editor-accent">layers</span>
            <span className="font-semibold text-editor-text-bright">PhotoClone AI</span>
          </div>
          <p className="text-center">
            &copy; 2026 PhotoClone AI · En alianza con{' '}
            <a href="https://cedula360.tech" className="text-editor-accent hover:underline">Cédula 360</a>{' '}
            ·{' '}
            <a href="mailto:info@cedula360.tech" className="text-editor-accent hover:underline">info@cedula360.tech</a>
          </p>
          <a href="https://github.com/bladealex9848/Clon_Photoshop" target="_blank" rel="noopener noreferrer" className="hover:text-editor-text-bright transition-colors">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
