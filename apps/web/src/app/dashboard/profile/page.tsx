'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  location: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Creative professional passionate about design and technology.',
      website: 'https://johndoe.com',
      location: 'San Francisco, CA',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
      // TODO: Implement profile update logic
      console.log('Profile data:', data)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <Avatar className="w-24 h-24">
                    <img src="/api/placeholder/100/100" alt="Profile" />
                  </Avatar>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Change Photo
                    </Button>
                  )}
                </div>

                <div className="flex-1">
                  {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <Input
                          {...register('name')}
                          placeholder="Full name"
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="Email address"
                          className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <textarea
                          {...register('bio')}
                          placeholder="Bio"
                          className={`w-full px-3 py-2 border rounded-md ${errors.bio ? 'border-red-500' : 'border-gray-300'}`}
                          rows={3}
                        />
                        {errors.bio && (
                          <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                        )}
                      </div>

                      <div>
                        <Input
                          {...register('website')}
                          placeholder="Website URL"
                          className={errors.website ? 'border-red-500' : ''}
                        />
                        {errors.website && (
                          <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
                        )}
                      </div>

                      <div>
                        <Input
                          {...register('location')}
                          placeholder="Location"
                        />
                      </div>

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">John Doe</h3>
                        <p className="text-gray-600">john@example.com</p>
                      </div>
                      <p className="text-gray-700">
                        Creative professional passionate about design and technology.
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>🌐 johndoe.com</span>
                        <span>📍 San Francisco, CA</span>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="secondary">Designer</Badge>
                        <Badge variant="secondary">Developer</Badge>
                        <Badge variant="secondary">Creator</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Your Posts</CardTitle>
              <CardDescription>All your posts and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your posts will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your marketplace listings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your products will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Settings options will appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}