'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@viport/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@viport/ui/components/ui/card';

interface LoginErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LoginError({ error, reset }: LoginErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Login page error:', error);
  }, [error]);

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-background to-secondary/5" />
      
      {/* Error Container */}
      <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        {/* Logo and Header */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive shadow-lg">
            <AlertTriangle className="h-8 w-8 text-destructive-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We encountered an error while loading the login page
          </p>
        </div>

        {/* Error Card */}
        <Card className="border-destructive/20 shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl text-destructive">Login Error</CardTitle>
            <CardDescription>
              {error.message || 'An unexpected error occurred. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && error.digest && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-mono text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <Button
                onClick={reset}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full"
              >
                <a href="/">Go to Homepage</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            If the problem persists, please{' '}
            <a
              href="/support"
              className="underline underline-offset-4 transition-colors hover:text-primary"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}