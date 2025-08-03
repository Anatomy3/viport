import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HomeFeed } from '@/components/posts/home-feed'
import { FeaturedProducts } from '@/components/products/featured-products'
import { TrendingCreators } from '@/components/creators/trending-creators'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening in your network.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest posts from your network</CardDescription>
            </CardHeader>
            <CardContent>
              <HomeFeed />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Posts</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Followers</span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Following</span>
                <span className="font-semibold">567</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Products Sold</span>
                <span className="font-semibold">8</span>
              </div>
            </CardContent>
          </Card>

          <TrendingCreators />
          <FeaturedProducts />
        </div>
      </div>
    </div>
  )
}