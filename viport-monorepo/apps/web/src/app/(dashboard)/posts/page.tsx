import type { Metadata } from 'next';
import { Suspense } from 'react';

import { PostFeed } from '@/components/feed/post-feed';
import { CreatePostButton } from '@/components/feed/create-post-button';
import { LoadingSpinner } from '@viport/ui/components/feedback/loading-spinner';
import { Button } from '@viport/ui/components/ui/button';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Browse and share posts on your social feed.',
};

export default function PostsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">
            Browse and share posts on your social feed
          </p>
        </div>
        <CreatePostButton>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </CreatePostButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">124</div>
            <div className="text-sm text-muted-foreground">Total Posts</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">1.2k</div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">346</div>
            <div className="text-sm text-muted-foreground">Comments</div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm text-muted-foreground">Shares</div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="rounded-lg border bg-card">
        <Suspense fallback={
          <div className="flex h-96 items-center justify-center">
            <LoadingSpinner />
          </div>
        }>
          <PostFeed />
        </Suspense>
      </div>
    </div>
  );
}