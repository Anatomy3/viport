import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import Link from 'next/link'

import { api } from '@/lib/api/client'
import { generatePortfolioMetadata, generateCreativeWorkStructuredData } from '@/lib/seo'
import { StructuredData, BreadcrumbStructuredData } from '@/components/seo/structured-data'
import { OptimizedImage, OptimizedGallery } from '@/components/optimized/optimized-image'
import { LazyLoad, LazyReveal } from '@/components/ui/lazy-load'
import { LoadingSkeleton, LoadingCard } from '@/components/ui/loading'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from '@/components/ui/error'
import { formatDate, formatNumber } from '@/lib/utils'
import { 
  Eye, 
  Heart, 
  Share, 
  ExternalLink, 
  Mail, 
  Twitter, 
  Linkedin, 
  Github,
  Calendar,
  MapPin,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Portfolio, User } from '@/types/api'

// Cached data fetching
const getPortfolio = cache(async (slug: string): Promise<Portfolio | null> => {
  try {
    const response = await api.get(`/portfolios/slug/${slug}`)
    return response.success ? response.data : null
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    return null
  }
})

const getPortfolioProjects = cache(async (portfolioId: string) => {
  try {
    const response = await api.get(`/portfolios/${portfolioId}/projects`)
    return response.success ? response.data : []
  } catch (error) {
    console.error('Error fetching portfolio projects:', error)
    return []
  }
})

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const portfolio = await getPortfolio(params.slug)
  
  if (!portfolio) {
    return {
      title: 'Portfolio Not Found - Viport',
      description: 'The requested portfolio could not be found.',
    }
  }

  return generatePortfolioMetadata(portfolio)
}

// Main page component
export default async function PortfolioPage({
  params,
}: {
  params: { slug: string }
}) {
  const portfolio = await getPortfolio(params.slug)

  if (!portfolio) {
    notFound()
  }

  const projects = await getPortfolioProjects(portfolio.id)

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Portfolios', url: '/portfolios' },
    { name: portfolio.title, url: `/portfolio/${portfolio.slug}` },
  ]

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <div className="min-h-screen bg-background">
        {/* Structured Data */}
        <StructuredData data={generateCreativeWorkStructuredData(portfolio)} />
        <BreadcrumbStructuredData items={breadcrumbItems} />

        {/* Hero Section */}
        <LazyReveal>
          <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Portfolio Info */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                      {portfolio.title}
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {portfolio.description}
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center space-x-4">
                    <OptimizedImage
                      src={portfolio.user.avatar || '/images/default-avatar.jpg'}
                      alt={`${portfolio.user.firstName} ${portfolio.user.lastName}`}
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-primary/20"
                      priority
                    />
                    <div>
                      <Link href={`/users/${portfolio.user.username}`}>
                        <h2 className="text-lg font-semibold hover:text-primary transition-colors">
                          {portfolio.user.firstName} {portfolio.user.lastName}
                        </h2>
                      </Link>
                      <p className="text-muted-foreground">
                        @{portfolio.user.username}
                      </p>
                    </div>
                  </div>

                  {/* Portfolio Stats */}
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>{formatNumber(portfolio.viewsCount)} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Updated {formatDate(portfolio.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button size="lg">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" size="lg">
                      <Heart className="mr-2 h-4 w-4" />
                      Like
                    </Button>
                  </div>
                </div>

                {/* Featured Image/Hero */}
                <div className="relative">
                  <OptimizedImage
                    src="/images/portfolio-hero.jpg"
                    alt={`${portfolio.title} - Featured work`}
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl"
                    priority
                    quality={95}
                  />
                </div>
              </div>
            </div>
          </section>
        </LazyReveal>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Portfolio Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About Section */}
              <LazyReveal delay={200}>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold">About This Portfolio</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {portfolio.description}
                    </p>
                  </div>
                </section>
              </LazyReveal>

              {/* Projects Section */}
              <LazyLoad fallback={<LoadingSkeleton lines={8} />}>
                <Suspense fallback={<LoadingSkeleton lines={8} />}>
                  <section className="space-y-8">
                    <h2 className="text-2xl font-bold">Featured Projects</h2>
                    <div className="grid gap-8">
                      {projects.map((project: any, index: number) => (
                        <LazyReveal key={project.id} delay={index * 100}>
                          <ProjectCard project={project} />
                        </LazyReveal>
                      ))}
                    </div>
                  </section>
                </Suspense>
              </LazyLoad>

              {/* Skills Section */}
              <LazyReveal delay={400}>
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold">Skills & Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Next.js', 'Node.js', 'Design', 'UI/UX'].map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </section>
              </LazyReveal>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* User Profile Card */}
              <LazyReveal delay={300}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <OptimizedImage
                        src={portfolio.user.avatar || '/images/default-avatar.jpg'}
                        alt={`${portfolio.user.firstName} ${portfolio.user.lastName}`}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                      <div>
                        <CardTitle className="text-lg">
                          {portfolio.user.firstName} {portfolio.user.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Creative Professional
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {portfolio.user.bio && (
                      <p className="text-sm text-muted-foreground">
                        {portfolio.user.bio}
                      </p>
                    )}
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold">
                          {formatNumber(portfolio.user.followersCount)}
                        </p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {formatNumber(portfolio.user.followingCount)}
                        </p>
                        <p className="text-xs text-muted-foreground">Following</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {formatNumber(portfolio.user.postsCount)}
                        </p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                      </div>
                    </div>

                    {/* Social Links */}
                    {portfolio.user.socialLinks && (
                      <div className="flex justify-center space-x-3">
                        {portfolio.user.socialLinks.twitter && (
                          <Button variant="outline" size="sm">
                            <Twitter className="h-4 w-4" />
                          </Button>
                        )}
                        {portfolio.user.socialLinks.linkedin && (
                          <Button variant="outline" size="sm">
                            <Linkedin className="h-4 w-4" />
                          </Button>
                        )}
                        {portfolio.user.socialLinks.github && (
                          <Button variant="outline" size="sm">
                            <Github className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}

                    <Button className="w-full">
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              </LazyReveal>

              {/* Contact Card */}
              <LazyReveal delay={500}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Get In Touch</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Interested in working together? Let's connect!
                    </p>
                    <Button className="w-full">
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              </LazyReveal>

              {/* Similar Portfolios */}
              <LazyLoad fallback={<LoadingCard />} rootMargin="300px">
                <Card>
                  <CardHeader>
                    <CardTitle>Similar Portfolios</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <OptimizedImage
                            src={`/images/portfolio-${i}.jpg`}
                            alt={`Portfolio ${i}`}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Portfolio Title {i}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              By User {i}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </LazyLoad>
            </aside>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

// Project card component
function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-video md:aspect-square">
          <OptimizedImage
            src={project.image || '/images/project-placeholder.jpg'}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {project.technologies?.map((tech: string) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Project
            </Button>
            {project.githubUrl && (
              <Button variant="outline" size="sm">
                <Github className="mr-2 h-4 w-4" />
                Code
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

// Generate static params for popular portfolios
export async function generateStaticParams() {
  try {
    const response = await api.get('/portfolios?limit=50&public=true')
    const portfolios = response.success ? response.data : []
    
    return portfolios.map((portfolio: Portfolio) => ({
      slug: portfolio.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}