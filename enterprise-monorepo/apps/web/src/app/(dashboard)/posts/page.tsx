import { Suspense } from 'react'
import { Metadata } from 'next'
import { Plus } from 'lucide-react'

import { Button } from '@viport/ui'
import { CreatePostDialog } from '@/components/posts/create-post-dialog'
import { PostsFeed } from '@/components/posts/posts-feed'
import { PostsFilters } from '@/components/posts/posts-filters'
import { FeedSkeleton } from '@/components/ui/skeletons'

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Share your creative work and discover amazing content from other creators',
}

export default function PostsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Share your creative work and connect with the community
          </p>
        </div>
        <CreatePostDialog>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </CreatePostDialog>
      </div>

      {/* Filters */}
      <PostsFilters />

      {/* Posts Feed */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Suspense fallback={<FeedSkeleton />}>
            <PostsFeed />
          </Suspense>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <div className="space-y-6">
            {/* Trending Tags */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Trending Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['photography', 'digitalart', 'design', 'painting', 'sculpture'].map((tag) => (
                  <Button
                    key={tag}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Popular Posts */}
            <div className="rounded-lg border bg-card p-6">
              <h3 className="font-semibold mb-4">Popular This Week</h3>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Amazing Sunset Capture</p>
                      <p className="text-xs text-muted-foreground">1.2K likes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}