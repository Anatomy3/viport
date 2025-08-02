'use client'

import { Card, CardContent, CardHeader } from '@viport/ui'

export function HomeFeed() {
  // This would typically fetch data from your API
  const posts = [
    {
      id: 1,
      user: { name: 'Sarah Chen', username: 'sarahcreates', avatar: '/avatars/sarah.jpg' },
      content: 'Just finished this amazing sunset landscape! The colors were absolutely magical 🌅',
      image: '/posts/sunset.jpg',
      likes: 142,
      comments: 23,
      timeAgo: '2 hours ago'
    },
    {
      id: 2,
      user: { name: 'Alex Rivera', username: 'alexart', avatar: '/avatars/alex.jpg' },
      content: 'Working on a new digital art series. Here\'s a sneak peek of the first piece!',
      image: '/posts/digital-art.jpg',
      likes: 89,
      comments: 15,
      timeAgo: '4 hours ago'
    },
    {
      id: 3,
      user: { name: 'Maya Patel', username: 'mayaphoto', avatar: '/avatars/maya.jpg' },
      content: 'Street photography from my weekend walk around the city. Love capturing these candid moments.',
      image: '/posts/street-photo.jpg',
      likes: 256,
      comments: 41,
      timeAgo: '6 hours ago'
    }
  ]

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-full" />
              <div>
                <p className="font-semibold">{post.user.name}</p>
                <p className="text-sm text-muted-foreground">@{post.user.username} • {post.timeAgo}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>{post.content}</p>
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg" />
              <div className="flex justify-between items-center">
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}