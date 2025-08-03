import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Viport</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enterprise-grade social media platform with marketplace and portfolio builder.
            Connect, create, and commercialize your digital presence.
          </p>
          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Social Feed</CardTitle>
              <CardDescription>
                Share your thoughts, images, and connect with your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Instagram-like feed with posts, likes, comments, and real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Digital Marketplace</CardTitle>
              <CardDescription>
                Buy and sell digital products and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monetize your skills with integrated payment processing and creator tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Builder</CardTitle>
              <CardDescription>
                Create stunning portfolios with drag-and-drop interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Showcase your work with customizable templates and professional layouts.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Available on All Platforms
          </h2>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">Web App</h3>
              <p className="text-gray-600">Full-featured Next.js application</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">Android App</h3>
              <p className="text-gray-600">Native Kotlin application</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">iOS App</h3>
              <p className="text-gray-600">Native SwiftUI application</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}