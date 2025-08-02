'use client'

export function FeaturedProducts() {
  const products = [
    { name: 'Digital Art Pack', price: '$29', image: '/products/art-pack.jpg' },
    { name: 'Lightroom Presets', price: '$15', image: '/products/presets.jpg' },
    { name: 'UI Design Kit', price: '$49', image: '/products/ui-kit.jpg' },
  ]

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={index} className="space-y-2">
          <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg" />
          <div>
            <p className="font-medium text-sm">{product.name}</p>
            <p className="text-sm text-primary font-semibold">{product.price}</p>
          </div>
        </div>
      ))}
    </div>
  )
}