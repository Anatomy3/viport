import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function TrendingCreators() {
  const mockCreators = [
    {
      id: '1',
      name: 'Alex Johnson',
      username: '@alexj',
      avatar: '/api/placeholder/40/40',
      followers: '1.2k',
    },
    {
      id: '2',
      name: 'Sarah Wilson', 
      username: '@sarahw',
      avatar: '/api/placeholder/40/40',
      followers: '890',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trending Creators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockCreators.map((creator) => (
          <div key={creator.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={creator.avatar} />
                <AvatarFallback>{creator.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-medium">{creator.name}</h4>
                <p className="text-xs text-gray-500">{creator.username} • {creator.followers} followers</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Follow
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}