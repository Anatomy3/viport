import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { api } from '@/lib/api/client'
import { generatePostMetadata, generateArticleStructuredData } from '@/lib/seo'
import { StructuredData, BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { OptimizedImage } from '@/components/optimized/optimized-image'
import { LazyLoad, LazyReveal } from '@/components/ui/lazy-load'
import { LoadingSkeleton, LoadingCard } from '@/components/ui/loading'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/ui/error'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import { Heart, MessageCircle, Share, Bookmark, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Post } from '@/types/api'

// Cached data fetching
const getPost = cache(async (id: string): Promise<Post | null> => {
  try {
    const response = await api.get(`/posts/${id}`)
    return response.success ? response.data : null
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
})

const getRelatedPosts = cache(async (postId: string, authorId: string): Promise<Post[]> => {
  try {
    const response = await api.get(`/posts?authorId=${authorId}&exclude=${postId}&limit=3`)
    return response.success ? response.data : []
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
})

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const post = await getPost(params.id)
  
  if (!post) {
    return {
      title: 'Post Not Found - Viport',
      description: 'The requested post could not be found.',
    }
  }

  return generatePostMetadata(post)
}

// Main page component
export default async function PostPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id, post.author.id)

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Posts', url: '/posts' },
    { name: post.content.slice(0, 50) + '...', url: `/posts/${post.id}` },
  ]

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <div className="min-h-screen bg-background">
        {/* Structured Data */}
        <StructuredData data={generateArticleStructuredData(post)} />
        <BreadcrumbStructuredData items={breadcrumbItems} />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <article className="space-y-8">
            {/* Post Header */}
            <LazyReveal>
              <header className="space-y-6">
                <div className="flex items-center space-x-4">
                  <OptimizedImage
                    src={post.author.avatar || '/images/default-avatar.jpg'}
                    alt={`${post.author.firstName} ${post.author.lastName}`}
                    width={64}
                    height={64}
                    className="rounded-full"
                    priority
                  />
                  <div>
                    <h1 className="text-xl font-semibold">
                      {post.author.firstName} {post.author.lastName}
                    </h1>
                    <p className="text-muted-foreground">
                      @{post.author.username} · {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-wrap text-lg leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>
            </LazyReveal>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <LazyReveal delay={200}>
                <section className="space-y-4">
                  <div className="grid gap-4">
                    {post.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative overflow-hidden rounded-lg"
                      >
                        <OptimizedImage
                          src={image.url}
                          alt={image.alt || `Post image ${index + 1}`}
                          width={800}
                          height={600}
                          priority={index === 0}
                          quality={90}
                          className="w-full h-auto"
                          sizes="(max-width: 768px) 100vw, 800px"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </LazyReveal>
            )}

            {/* Post Actions */}
            <LazyReveal delay={400}>
              <section className="border-y py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Heart className="h-5 w-5" />
                      <span>{formatNumber(post.likesCount)}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{formatNumber(post.commentsCount)}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Share className="h-5 w-5" />
                      <span>{formatNumber(post.sharesCount)}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Eye className="h-5 w-5" />
                      <span>Views</span>
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </div>
              </section>
            </LazyReveal>

            {/* Comments Section */}
            <LazyLoad fallback={<LoadingSkeleton lines={5} />}>
              <Suspense fallback={<LoadingSkeleton lines={5} />}>
                <CommentsSection postId={post.id} />
              </Suspense>
            </LazyLoad>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <LazyLoad
              fallback={<div className="grid gap-4 md:grid-cols-3"><LoadingCard /><LoadingCard /><LoadingCard /></div>}
              rootMargin="200px"
            >
              <aside className="mt-12">
                <h2 className="text-2xl font-bold mb-6">
                  More from {post.author.firstName}
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {relatedPosts.map((relatedPost, index) => (
                    <LazyReveal key={relatedPost.id} delay={index * 100}>
                      <RelatedPostCard post={relatedPost} />
                    </LazyReveal>
                  ))}
                </div>
              </aside>
            </LazyLoad>
          )}
        </main>
      </div>
    </ErrorBoundary>
  )
}

// Comments section component (lazy loaded)
async function CommentsSection({ postId }: { postId: string }) {
  // This would typically fetch comments from your API
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Comments</h2>
      <div className="space-y-4">
        <div className="text-muted-foreground">
          Comments functionality would be implemented here with real-time updates.
        </div>
      </div>
    </section>
  )
}

// Related post card component
function RelatedPostCard({ post }: { post: Post }) {
  return (
    <article className="group cursor-pointer">
      <div className="space-y-3">
        {post.images && post.images.length > 0 && (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <OptimizedImage
              src={post.images[0].url}
              alt={post.images[0].alt || 'Post preview'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {formatRelativeTime(post.createdAt)}
          </p>
          <p className="line-clamp-3 text-sm">
            {post.content}
          </p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span>{formatNumber(post.likesCount)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-3 w-3" />
              <span>{formatNumber(post.commentsCount)}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

// Generate static params for popular posts (optional)
export async function generateStaticParams() {
  try {
    const response = await api.get('/posts?limit=100&popular=true')
    const posts = response.success ? response.data : []
    
    return posts.map((post: Post) => ({
      id: post.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}