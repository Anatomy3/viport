import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'

import { Providers } from '@/providers'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Viport - Creative Social Marketplace',
    template: '%s | Viport',
  },
  description: 'The ultimate platform for creators to showcase, connect, and sell their work. Join thousands of artists, designers, and entrepreneurs building their creative careers.',
  keywords: [
    'creative marketplace',
    'social media',
    'portfolio',
    'art',
    'design',
    'creators',
    'sell artwork',
    'creative community',
  ],
  authors: [{ name: 'Viport Team' }],
  creator: 'Viport',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://viport.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://viport.com',
    siteName: 'Viport',
    title: 'Viport - Creative Social Marketplace',
    description: 'The ultimate platform for creators to showcase, connect, and sell their work.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Viport - Creative Social Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viport - Creative Social Marketplace',
    description: 'The ultimate platform for creators to showcase, connect, and sell their work.',
    images: ['/og-image.png'],
    creator: '@viport',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}