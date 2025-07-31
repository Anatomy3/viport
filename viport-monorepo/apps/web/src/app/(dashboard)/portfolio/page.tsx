import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';

import { PortfolioGrid } from '@/components/portfolio/portfolio-grid';
import { LoadingSpinner } from '@viport/ui/components/feedback/loading-spinner';
import { Button } from '@viport/ui/components/ui/button';
import { Plus, Settings } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Manage and showcase your creative portfolio.',
};

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage and showcase your creative portfolio
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button asChild>
            <Link href="/portfolio/builder">
              <Plus className="mr-2 h-4 w-4" />
              Create Portfolio
            </Link>
          </Button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-muted-foreground">Portfolios</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">2.1k</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">47</div>
            <div className="text-sm text-muted-foreground">Projects</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-muted-foreground">Clients</div>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Portfolios</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button variant="outline" size="sm">
              Sort
            </Button>
          </div>
        </div>
        
        <Suspense fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        }>
          <PortfolioGrid />
        </Suspense>
      </div>
    </div>
  );
}