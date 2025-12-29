import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Photoshop Clone - Editor de Imágenes con IA',
  description: 'Editor de imágenes profesional en el navegador con separación de capas mediante IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
