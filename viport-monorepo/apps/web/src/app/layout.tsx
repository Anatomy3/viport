import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@viport/ui/lib/utils';

import { TRPCProvider } from '@/providers/trpc-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/providers/auth-provider';

import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Viport - Enterprise Social Media Platform',
    template: '%s | Viport',
  },
  description: 'Enterprise-grade social media platform with Instagram-like feed, digital marketplace, and portfolio builder',
  keywords: [
    'social media',
    'portfolio',
    'marketplace',
    'creator economy',
    'digital products',
    'social networking',
  ],
  authors: [
    {
      name: 'Viport Team',
    },
  ],
  creator: 'Viport Team',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Viport - Enterprise Social Media Platform',
    description: 'Enterprise-grade social media platform with Instagram-like feed, digital marketplace, and portfolio builder',
    siteName: 'Viport',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Viport - Enterprise Social Media Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viport - Enterprise Social Media Platform',
    description: 'Enterprise-grade social media platform with Instagram-like feed, digital marketplace, and portfolio builder',
    images: ['/og-image.png'],
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TRPCProvider>
              {children}
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}