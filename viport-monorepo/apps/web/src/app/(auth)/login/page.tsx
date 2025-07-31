import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

import { LoginForm } from '@/components/auth/login-form';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@viport/ui/components/ui/card';
import { Separator } from '@viport/ui/components/ui/separator';
import { LoadingSpinner } from '@viport/ui/components/feedback/loading-spinner';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Sign in to Viport',
  description: 'Access your Viport account to manage your portfolio, posts, and connect with the creative community.',
  keywords: ['login', 'sign in', 'authentication', 'viport', 'portfolio', 'social media'],
  openGraph: {
    title: 'Sign in to Viport',
    description: 'Access your Viport account to manage your portfolio, posts, and connect with the creative community.',
    type: 'website',
    images: [
      {
        url: '/og-login.png',
        width: 1200,
        height: 630,
        alt: 'Viport Login Page',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign in to Viport',
    description: 'Access your Viport account to manage your portfolio, posts, and connect with the creative community.',
    images: ['/og-login.png'],
  },
  robots: {
    index: false, // Don't index login pages
    follow: false,
  },
  alternates: {
    canonical: '/login',
  },
};

// Server Component - runs on server
export default async function LoginPage() {
  // Server-side authentication check
  const session = await getServerSession();
  
  // Redirect if already authenticated
  if (session) {
    redirect('/beranda');
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Login Form Container */}
      <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        {/* Logo and Header */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">V</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your Viport account to continue
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-xl">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google OAuth Button */}
            <Suspense fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}>
              <GoogleAuthButton />
            </Suspense>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <Suspense fallback={<LoadingSpinner />}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        {/* Sign up link */}
        <p className="px-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a
            href="/register"
            className="underline underline-offset-4 transition-colors hover:text-primary focus:text-primary focus:outline-none"
          >
            Create an account
          </a>
        </p>

        {/* Footer Links */}
        <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
          <a
            href="/privacy"
            className="underline underline-offset-4 transition-colors hover:text-primary"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="underline underline-offset-4 transition-colors hover:text-primary"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}