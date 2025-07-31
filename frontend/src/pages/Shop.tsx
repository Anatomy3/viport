import { useState } from 'react'
import { FiShoppingCart, FiHeart, FiStar, FiGrid, FiList, FiSearch } from 'react-icons/fi'

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  rating: number
  reviews: number
  image: string
  tags: string[]
  isDigital: boolean
  downloadCount?: number
  fileSize?: string
  fileType?: string
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Premium React Dashboard Template',
    description: 'Professional admin dashboard template with 50+ components, dark/light theme, and TypeScript support.',
    price: 49,
    originalPrice: 99,
    category: 'Templates',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400',
    tags: ['React', 'TypeScript', 'Dashboard', 'Admin'],
    isDigital: true,
    downloadCount: 1250,
    fileSize: '45 MB',
    fileType: 'ZIP'
  },
  {
    id: '2',
    name: 'Complete Node.js API Course',
    description: 'Learn to build REST APIs with Node.js, Express, MongoDB. Includes JWT authentication and deployment.',
    price: 79,
    category: 'Courses',
    rating: 4.9,
    reviews: 2340,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    tags: ['Node.js', 'API', 'MongoDB', 'Course'],
    isDigital: true,
    downloadCount: 3420,
    fileSize: '2.1 GB',
    fileType: 'MP4'
  },
  {
    id: '3',
    name: 'UI/UX Design System',
    description: 'Complete design system with 200+ components, icons, and style guide for modern applications.',
    price: 29,
    category: 'Design',
    rating: 4.7,
    reviews: 890,
    image: 'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?w=400',
    tags: ['Figma', 'Design System', 'UI Kit', 'Components'],
    isDigital: true,
    downloadCount: 2100,
    fileSize: '120 MB',
    fileType: 'FIG'
  },
  {
    id: '4',
    name: 'E-Commerce Mobile App Template',
    description: 'Cross-platform mobile app template for e-commerce with payment integration and admin panel.',
    price: 149,
    originalPrice: 199,
    category: 'Mobile',
    rating: 4.6,
    reviews: 450,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    tags: ['React Native', 'E-commerce', 'Mobile', 'Payment'],
    isDigital: true,
    downloadCount: 680,
    fileSize: '180 MB',
    fileType: 'ZIP'
  },
  {
    id: '5',
    name: 'Advanced JavaScript Patterns',
    description: 'Deep dive into JavaScript design patterns, performance optimization, and best practices.',
    price: 59,
    category: 'Ebooks',
    rating: 4.8,
    reviews: 1200,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    tags: ['JavaScript', 'Patterns', 'Performance', 'Best Practices'],
    isDigital: true,
    downloadCount: 1800,
    fileSize: '15 MB',
    fileType: 'PDF'
  },
  {
    id: '6',
    name: 'Landing Page Templates Pack',
    description: 'Collection of 10 modern landing page templates optimized for conversion and SEO.',
    price: 39,
    category: 'Templates',
    rating: 4.5,
    reviews: 720,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    tags: ['HTML', 'CSS', 'Landing Page', 'SEO'],
    isDigital: true,
    downloadCount: 950,
    fileSize: '85 MB',
    fileType: 'ZIP'
  }
]

const categories = ['All', 'Templates', 'Courses', 'Design', 'Mobile', 'Ebooks']

export const Shop = () => {
  const [products] = useState<Product[]>(sampleProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(sampleProducts)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<string[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])

  const filterProducts = (category: string, search: string) => {
    let filtered = products

    if (category !== 'All') {
      filtered = filtered.filter(product => product.category === category)
    }

    if (search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'popular':
      default:
        filtered.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
        break
    }

    setFilteredProducts(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterProducts(category, searchQuery)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    filterProducts(selectedCategory, search)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterProducts(selectedCategory, searchQuery)
  }

  const addToCart = (productId: string) => {
    if (!cart.includes(productId)) {
      setCart([...cart, productId])
    }
  }

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId))
    } else {
      setWishlist([...wishlist, productId])
    }
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="card hover:shadow-lg transition-shadow group">
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              wishlist.includes(product.id)
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:text-red-500'
            }`}
          >
            <FiHeart size={16} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {product.category}
          </span>
          <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <FiStar className="text-yellow-400 fill-current" size={14} />
            <span className="text-sm font-medium text-gray-900">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">({product.reviews})</span>
          {product.downloadCount && (
            <span className="text-xs text-gray-400">• {product.downloadCount} downloads</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product.id)}
            disabled={cart.includes(product.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              cart.includes(product.id)
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <FiShoppingCart size={16} />
            <span>{cart.includes(product.id) ? 'In Cart' : 'Add to Cart'}</span>
          </button>
        </div>

        {product.isDigital && (
          <div className="text-xs text-gray-500 flex items-center justify-between pt-2 border-t border-gray-100">
            <span>Digital Download</span>
            <span>{product.fileSize} • {product.fileType}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Shop</h1>
          <p className="text-gray-600 mt-1">Discover premium digital products for developers and designers</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FiShoppingCart size={16} />
          <span>{cart.length} items in cart</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* View & Sort */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiSearch size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FiShoppingCart size={20} className="text-primary-600" />
              <span className="font-medium">{cart.length} items</span>
            </div>
            <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}