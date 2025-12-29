import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editor: {
          bg: '#1e1e1e',
          surface: '#252526',
          'surface-hover': '#2a2d2e',
          border: '#3c3c3c',
          'border-light': '#454545',
          active: '#094771',
          text: '#cccccc',
          'text-muted': '#808080',
          'text-bright': '#ffffff',
          accent: '#0078d4',
          'accent-hover': '#1a8cff',
          warning: '#f59e0b',
          error: '#ef4444',
          success: '#22c55e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        material: ['Material Symbols Outlined'],
      },
      animation: {
        'marching-ants': 'marching-ants 0.5s linear infinite',
      },
      keyframes: {
        'marching-ants': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '16' },
        },
      },
    },
  },
  plugins: [],
}

export default config
