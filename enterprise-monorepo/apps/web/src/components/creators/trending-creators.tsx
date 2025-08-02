'use client'

import { Button } from '@viport/ui'

export function TrendingCreators() {
  const creators = [
    { name: 'Emma Wilson', username: 'emmacreates', followers: '12.5K' },
    { name: 'David Kim', username: 'davidart', followers: '8.3K' },
    { name: 'Lisa Zhang', username: 'lisadesign', followers: '15.2K' },
    { name: 'Carlos Silva', username: 'carlosphoto', followers: '6.7K' },
    { name: 'Aisha Patel', username: 'aishapaints', followers: '9.1K' },
  ]

  return (
    <div className="space-y-4">
      {creators.map((creator, index) => (
        <div key={creator.username} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-full" />
            <div>
              <p className="font-medium text-sm">{creator.name}</p>
              <p className="text-xs text-muted-foreground">{creator.followers} followers</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Follow
          </Button>
        </div>
      ))}
    </div>
  )
}