'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  tags: z.string().optional(),
})

type ProductForm = z.infer<typeof productSchema>

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  status: 'active' | 'draft' | 'sold'
  image: string
  sales: number
  views: number
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'UI Design System',
    description: 'Complete design system with components and guidelines',
    price: 99.99,
    category: 'Design',
    status: 'active',
    image: '/api/placeholder/200/150',
    sales: 45,
    views: 1234,
  },
  {
    id: '2',
    name: 'React Component Library',
    description: 'Reusable React components for rapid development',
    price: 149.99,
    category: 'Development',
    status: 'active',
    image: '/api/placeholder/200/150',
    sales: 23,
    views: 856,
  },
  {
    id: '3',
    name: 'Logo Design Package',
    description: 'Professional logo design with multiple variations',
    price: 299.99,
    category: 'Branding',
    status: 'draft',
    image: '/api/placeholder/200/150',
    sales: 0,
    views: 45,
  },
]

export default function ShopPage() {
  const [products, setProducts] = useState(mockProducts)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const onSubmit = async (data: ProductForm) => {
    setIsLoading(true)
    try {
      // TODO: Implement product creation logic
      console.log('Product data:', data)
      toast.success('Product created successfully!')
      reset()
      setIsCreating(false)
    } catch (error) {
      toast.error('Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProductStatus = (productId: string, status: Product['status']) => {
    setProducts(products =>
      products.map(product =>
        product.id === productId ? { ...product, status } : product
      )
    )
    toast.success('Product status updated!')
  }

  const totalSales = products.reduce((sum, product) => sum + (product.sales * product.price), 0)
  const totalViews = products.reduce((sum, product) => sum + product.views, 0)
  const activeProducts = products.filter(p => p.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
          <p className="text-gray-600">Manage your digital products and marketplace</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          Add Product
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">${totalSales.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{products.length}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{activeProducts}</div>
                  <div className="text-sm text-gray-600">Active Products</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{totalViews}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Your latest product sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products
                  .filter(p => p.sales > 0)
                  .slice(0, 5)
                  .map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${(product.sales * product.price).toFixed(2)}</div>
                        <div className="text-sm text-gray-600">${product.price} each</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage your digital products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="border rounded-lg overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge 
                          variant={product.status === 'active' ? 'default' : 'secondary'}
                        >
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-lg">${product.price}</span>
                        <span className="text-sm text-gray-600">{product.sales} sold</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateProductStatus(
                            product.id, 
                            product.status === 'active' ? 'draft' : 'active'
                          )}
                        >
                          {product.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Track your product orders and sales</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Order management will be implemented here...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed analytics for your shop</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analytics dashboard will be implemented here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Product Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>Create a new digital product for your shop</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input
                    {...register('name')}
                    placeholder="Product name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <textarea
                    {...register('description')}
                    placeholder="Product description"
                    className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    {...register('price', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Price ($)"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <select
                    {...register('category')}
                    className={`w-full px-3 py-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select category</option>
                    <option value="Design">Design</option>
                    <option value="Development">Development</option>
                    <option value="Branding">Branding</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    {...register('tags')}
                    placeholder="Tags (comma separated)"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Creating...' : 'Create Product'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}