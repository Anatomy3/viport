import { Suspense } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { FeedSkeleton } from '@/components/ui/skeletons'
import { HomeFeed } from '@/components/posts/home-feed'
import { TrendingCreators } from '@/components/creators/trending-creators'
import { FeaturedProducts } from '@/components/products/featured-products'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover amazing creators and their work on Viport',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Where Creativity
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {' '}Meets Commerce
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Join thousands of creators showcasing their work, building their audience, 
              and earning from their passion. Share your story, discover amazing art, 
              and support independent creators.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/explore">
                  Explore Creators
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Feed */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Latest from Creators</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/posts">View All</Link>
                </Button>
              </div>
              
              <Suspense fallback={<FeedSkeleton />}>
                <HomeFeed />
              </Suspense>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="space-y-8">
              {/* Trending Creators */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Trending Creators</h3>
                <Suspense fallback={<div className="animate-pulse space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>}>
                  <TrendingCreators />
                </Suspense>
              </div>

              {/* Featured Products */}
              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Featured Products</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/shop">View All</Link>
                  </Button>
                </div>
                <Suspense fallback={<div className="animate-pulse space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="aspect-square bg-muted rounded-lg" />
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>}>
                  <FeaturedProducts />
                </Suspense>
              </div>

              {/* Call to Action */}
              <div className="rounded-lg border bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
                <h3 className="text-lg font-semibold mb-2">Start Creating Today</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our community of creators and start earning from your passion.
                </p>
                <Button className="w-full" asChild>
                  <Link href="/register">Join Viport</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}