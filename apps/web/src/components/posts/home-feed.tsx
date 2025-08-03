export function HomeFeed() {
  const mockPosts = [
    {
      id: '1',
      user: { name: 'John Doe', avatar: '/api/placeholder/40/40' },
      content: 'Just finished working on a new design project!',
      createdAt: '2 hours ago',
      likes: 24,
      comments: 5,
    },
    {
      id: '2', 
      user: { name: 'Jane Smith', avatar: '/api/placeholder/40/40' },
      content: 'Excited to share my latest portfolio piece 🎨',
      createdAt: '4 hours ago',
      likes: 18,
      comments: 3,
    },
  ]

  return (
    <div className="space-y-4">
      {mockPosts.map((post) => (
        <div key={post.id} className="border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={post.user.avatar} 
              alt={post.user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h4 className="font-medium">{post.user.name}</h4>
              <p className="text-sm text-gray-500">{post.createdAt}</p>
            </div>
          </div>
          <p className="mb-3">{post.content}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
          </div>
        </div>
      ))}
    </div>
  )
}