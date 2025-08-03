import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function FeaturedProducts() {
  const mockProducts = [
    {
      id: '1',
      name: 'UI Kit Pro',
      price: '$49',
      image: '/api/placeholder/150/100',
    },
    {
      id: '2',
      name: 'Design System',
      price: '$99',
      image: '/api/placeholder/150/100',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Featured Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockProducts.map((product) => (
          <div key={product.id} className="flex items-center space-x-3">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-12 h-8 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="text-sm font-medium">{product.name}</h4>
              <p className="text-sm text-gray-500">{product.price}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}