import { MetadataRoute } from 'next'
import { api } from '@/lib/api/client'

// Dynamic sitemap generation
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://viport.com'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  try {
    // Fetch dynamic content
    const [users, posts, portfolios] = await Promise.allSettled([
      fetchUsers(),
      fetchPosts(),
      fetchPortfolios(),
    ])

    // User profiles
    const userRoutes: MetadataRoute.Sitemap = 
      users.status === 'fulfilled' 
        ? users.value.map((user: any) => ({
            url: `${baseUrl}/users/${user.username}`,
            lastModified: new Date(user.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          }))
        : []

    // Public posts
    const postRoutes: MetadataRoute.Sitemap = 
      posts.status === 'fulfilled'
        ? posts.value.map((post: any) => ({
            url: `${baseUrl}/posts/${post.id}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          }))
        : []

    // Public portfolios
    const portfolioRoutes: MetadataRoute.Sitemap = 
      portfolios.status === 'fulfilled'
        ? portfolios.value.map((portfolio: any) => ({
            url: `${baseUrl}/portfolio/${portfolio.slug}`,
            lastModified: new Date(portfolio.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }))
        : []

    return [...staticRoutes, ...userRoutes, ...postRoutes, ...portfolioRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticRoutes
  }
}

// Fetch functions with caching
async function fetchUsers() {
  try {
    const response = await api.get('/users?limit=1000&public=true')
    return response.data || []
  } catch (error) {
    console.error('Error fetching users for sitemap:', error)
    return []
  }
}

async function fetchPosts() {
  try {
    const response = await api.get('/posts?limit=1000&visibility=public')
    return response.data || []
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error)
    return []
  }
}

async function fetchPortfolios() {
  try {
    const response = await api.get('/portfolios?limit=1000&public=true')
    return response.data || []
  } catch (error) {
    console.error('Error fetching portfolios for sitemap:', error)
    return []
  }
}