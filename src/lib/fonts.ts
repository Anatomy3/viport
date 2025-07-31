import { Inter, Poppins, JetBrains_Mono } from 'next/font/google'

// Primary font - Inter
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
})

// Heading font - Poppins
export const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  fallback: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'sans-serif',
  ],
})

// Monospace font - JetBrains Mono
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false, // Only load when needed
  fallback: [
    'Monaco',
    'Cascadia Code',
    'Segoe UI Mono',
    'Roboto Mono',
    'Oxygen Mono',
    'Ubuntu Monospace',
    'Source Code Pro',
    'Fira Mono',
    'Droid Sans Mono',
    'Courier New',
    'monospace',
  ],
})

// Font class names for easy use
export const fontVariables = `${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`