import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { GuestOnly } from '@/components/auth/protected-route'
import { LoadingSpinner } from '@/components/ui/loading'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GuestOnly>
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left side - Auth forms */}
        <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            <div className="text-center mb-8">
              <Link href="/" className="inline-block">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded bg-primary" />
                  <span className="text-2xl font-bold">Viport</span>
                </div>
              </Link>
            </div>
            
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            }>
              {children}
            </Suspense>
          </div>
        </div>

        {/* Right side - Hero image/content */}
        <div className="hidden lg:block relative bg-gradient-to-br from-primary to-secondary">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative h-full flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-6">
                Join the Creative Revolution
              </h2>
              <p className="text-xl opacity-90 max-w-md">
                Connect with fellow creators, showcase your work, and build your dream career 
                in the creative industry.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-sm opacity-75">Active Creators</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">1M+</div>
                  <div className="text-sm opacity-75">Artworks Shared</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 h-20 w-20 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
          <div className="absolute top-1/2 left-1/4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
        </div>
      </div>
    </GuestOnly>
  )
}