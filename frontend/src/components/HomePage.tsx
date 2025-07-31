import { Feed } from '@/components/Feed/Feed'

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <Feed />
      </div>
    </div>
  )
}