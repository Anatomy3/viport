import { z } from 'zod'
import { Timestamps, SoftDelete, Location } from './common'
import { User } from './users'

// Product types
export interface Product {
  id: string
  sellerId: string
  seller?: User
  title: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  currency: string
  images: string[]
  videos?: string[]
  category: ProductCategory
  subcategory?: string
  tags: string[]
  condition: ProductCondition
  availability: ProductAvailability
  stock?: number
  dimensions?: ProductDimensions
  weight?: number
  materials?: string[]
  colors?: string[]
  sizes?: string[]
  location?: Location
  shippingInfo: ShippingInfo
  stats: ProductStats
  isDigital: boolean
  digitalFiles?: DigitalFile[]
  isFeatured: boolean
  isPromoted: boolean
  status: ProductStatus
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export enum ProductCategory {
  ART = 'art',
  PHOTOGRAPHY = 'photography',
  DESIGN = 'design',
  FASHION = 'fashion',
  JEWELRY = 'jewelry',
  HOME_DECOR = 'home_decor',
  CRAFTS = 'crafts',
  DIGITAL = 'digital',
  SERVICES = 'services',
  BOOKS = 'books',
  MUSIC = 'music',
  SOFTWARE = 'software',
  TEMPLATES = 'templates',
  COURSES = 'courses',
  OTHER = 'other'
}

export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor'
}

export enum ProductAvailability {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LIMITED_STOCK = 'limited_stock',
  PRE_ORDER = 'pre_order',
  DISCONTINUED = 'discontinued'
}

export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  SOLD = 'sold'
}

export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: 'cm' | 'in'
}

export interface ShippingInfo {
  freeShipping: boolean
  shippingCost?: number
  shippingRegions: string[]
  processingTime: string
  estimatedDelivery: string
  returnsAccepted: boolean
  returnPolicy?: string
}

export interface ProductStats {
  viewsCount: number
  likesCount: number
  savesCount: number
  ordersCount: number
  reviewsCount: number
  averageRating: number
}

export interface DigitalFile {
  id: string
  filename: string
  fileType: string
  fileSize: number
  downloadUrl: string
  previewUrl?: string
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  user?: User
  orderId?: string
  rating: number
  title?: string
  content?: string
  images?: string[]
  isVerifiedPurchase: boolean
  helpfulCount: number
  isHelpful?: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductQuestion {
  id: string
  productId: string
  userId: string
  user?: User
  question: string
  answer?: string
  answeredBy?: string
  answeredAt?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  buyerId: string
  buyer?: User
  sellerId: string
  seller?: User
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: string
  paymentId?: string
  shippingAddress: Address
  billingAddress?: Address
  trackingNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  selectedOptions?: Record<string, string>
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface Address {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phoneNumber?: string
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  estimatedShipping: number
  estimatedTax: number
  estimatedTotal: number
  currency: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  selectedOptions?: Record<string, string>
  addedAt: string
}

// Product request/response types
export interface CreateProductRequest {
  title: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  currency: string
  images: string[]
  videos?: string[]
  category: ProductCategory
  subcategory?: string
  tags: string[]
  condition: ProductCondition
  stock?: number
  dimensions?: ProductDimensions
  weight?: number
  materials?: string[]
  colors?: string[]
  sizes?: string[]
  location?: Location
  shippingInfo: ShippingInfo
  isDigital: boolean
  digitalFiles?: DigitalFile[]
}

export interface UpdateProductRequest {
  title?: string
  description?: string
  shortDescription?: string
  price?: number
  originalPrice?: number
  images?: string[]
  videos?: string[]
  category?: ProductCategory
  subcategory?: string
  tags?: string[]
  condition?: ProductCondition
  availability?: ProductAvailability
  stock?: number
  dimensions?: ProductDimensions
  weight?: number
  materials?: string[]
  colors?: string[]
  sizes?: string[]
  location?: Location
  shippingInfo?: ShippingInfo
  digitalFiles?: DigitalFile[]
  isFeatured?: boolean
  status?: ProductStatus
}

export interface GetProductsRequest {
  sellerId?: string
  category?: ProductCategory
  subcategory?: string
  condition?: ProductCondition
  availability?: ProductAvailability
  priceMin?: number
  priceMax?: number
  tags?: string[]
  location?: {
    latitude: number
    longitude: number
    radius: number
  }
  isDigital?: boolean
  isFeatured?: boolean
  sortBy?: 'created' | 'updated' | 'price' | 'views' | 'orders'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchProductsRequest {
  query?: string
  category?: ProductCategory
  subcategory?: string
  condition?: ProductCondition
  priceMin?: number
  priceMax?: number
  tags?: string[]
  location?: {
    latitude: number
    longitude: number
    radius: number
  }
  isDigital?: boolean
  sortBy?: 'relevance' | 'price' | 'created' | 'views' | 'orders'
  sortOrder?: 'asc' | 'desc'
}

// Product validation schemas
export const CreateProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  currency: z.string().length(3).default('USD'),
  images: z.array(z.string().url()).min(1).max(20),
  videos: z.array(z.string().url()).max(5).optional(),
  category: z.nativeEnum(ProductCategory),
  subcategory: z.string().max(100).optional(),
  tags: z.array(z.string().min(1).max(50)).max(20),
  condition: z.nativeEnum(ProductCondition),
  stock: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    unit: z.enum(['cm', 'in']),
  }).optional(),
  weight: z.number().min(0).optional(),
  materials: z.array(z.string().min(1).max(50)).max(10).optional(),
  colors: z.array(z.string().min(1).max(50)).max(10).optional(),
  sizes: z.array(z.string().min(1).max(50)).max(20).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  shippingInfo: z.object({
    freeShipping: z.boolean(),
    shippingCost: z.number().min(0).optional(),
    shippingRegions: z.array(z.string()),
    processingTime: z.string(),
    estimatedDelivery: z.string(),
    returnsAccepted: z.boolean(),
    returnPolicy: z.string().max(1000).optional(),
  }),
  isDigital: z.boolean(),
  digitalFiles: z.array(z.object({
    filename: z.string(),
    fileType: z.string(),
    fileSize: z.number(),
    downloadUrl: z.string().url(),
    previewUrl: z.string().url().optional(),
  })).optional(),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export const GetProductsSchema = z.object({
  sellerId: z.string().uuid().optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  subcategory: z.string().optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  availability: z.nativeEnum(ProductAvailability).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(1000),
  }).optional(),
  isDigital: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortBy: z.enum(['created', 'updated', 'price', 'views', 'orders']).default('created'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const SearchProductsSchema = z.object({
  query: z.string().min(1).optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  subcategory: z.string().optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(1000),
  }).optional(),
  isDigital: z.boolean().optional(),
  sortBy: z.enum(['relevance', 'price', 'created', 'views', 'orders']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Type guards
export const isProduct = (product: any): product is Product => {
  return (
    typeof product === 'object' &&
    product !== null &&
    typeof product.id === 'string' &&
    typeof product.sellerId === 'string' &&
    typeof product.title === 'string' &&
    typeof product.description === 'string' &&
    typeof product.price === 'number' &&
    Object.values(ProductCategory).includes(product.category) &&
    Object.values(ProductCondition).includes(product.condition)
  )
}