package models

import (
	"time"
)

// Common response structures
type ApiResponse struct {
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
	Success bool        `json:"success"`
	Meta    *Meta       `json:"meta,omitempty"`
}

type Meta struct {
	Page        int `json:"page"`
	Limit       int `json:"limit"`
	Total       int `json:"total"`
	TotalPages  int `json:"totalPages"`
	HasNext     bool `json:"hasNext"`
	HasPrevious bool `json:"hasPrevious"`
}

type ErrorResponse struct {
	Error   string                 `json:"error"`
	Message string                 `json:"message"`
	Code    string                 `json:"code,omitempty"`
	Details map[string]interface{} `json:"details,omitempty"`
	Success bool                   `json:"success"`
}

// Categories for organizing content
type Category struct {
	ID          string     `json:"id" db:"id"`
	Name        string     `json:"name" db:"name"`
	Slug        string     `json:"slug" db:"slug"`
	Description *string    `json:"description,omitempty" db:"description"`
	Icon        *string    `json:"icon,omitempty" db:"icon"`
	Color       *string    `json:"color,omitempty" db:"color"`
	ParentID    *string    `json:"parentId,omitempty" db:"parent_id"`
	IsActive    bool       `json:"isActive" db:"is_active"`
	SortOrder   int        `json:"sortOrder" db:"sort_order"`
	CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
	
	// Joined fields
	Parent   *Category `json:"parent,omitempty"`
	Children []Category `json:"children,omitempty"`
	ItemCount int       `json:"itemCount,omitempty"`
}

// Tags system
type Tag struct {
	ID         string    `json:"id" db:"id"`
	Name       string    `json:"name" db:"name"`
	Slug       string    `json:"slug" db:"slug"`
	UsageCount int       `json:"usageCount" db:"usage_count"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
}

// Follow system
type Follow struct {
	FollowerID  string    `json:"followerId" db:"follower_id"`
	FollowingID string    `json:"followingId" db:"following_id"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	
	// Joined fields
	Follower  *User `json:"follower,omitempty"`
	Following *User `json:"following,omitempty"`
}

// Like system
type Like struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"userId" db:"user_id"`
	LikeableType string    `json:"likeableType" db:"likeable_type"`
	LikeableID   string    `json:"likeableId" db:"likeable_id"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	
	// Joined fields
	User *User `json:"user,omitempty"`
}

// Comment system
type Comment struct {
	ID              string     `json:"id" db:"id"`
	UserID          string     `json:"userId" db:"user_id"`
	CommentableType string     `json:"commentableType" db:"commentable_type"`
	CommentableID   string     `json:"commentableId" db:"commentable_id"`
	ParentID        *string    `json:"parentId,omitempty" db:"parent_id"`
	Content         string     `json:"content" db:"content"`
	LikeCount       int        `json:"likeCount" db:"like_count"`
	CreatedAt       time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time  `json:"updatedAt" db:"updated_at"`
	
	// Joined fields
	User     *User     `json:"user,omitempty"`
	Parent   *Comment  `json:"parent,omitempty"`
	Replies  []Comment `json:"replies,omitempty"`
	IsLiked  bool      `json:"isLiked,omitempty"`
}

// Transaction system
type Transaction struct {
	ID            string    `json:"id" db:"id"`
	BuyerID       string    `json:"buyerId" db:"buyer_id"`
	SellerID      string    `json:"sellerId" db:"seller_id"`
	ItemType      string    `json:"itemType" db:"item_type"`
	ItemID        string    `json:"itemId" db:"item_id"`
	Amount        float64   `json:"amount" db:"amount"`
	FeeAmount     float64   `json:"feeAmount" db:"fee_amount"`
	NetAmount     float64   `json:"netAmount" db:"net_amount"`
	Currency      string    `json:"currency" db:"currency"`
	PaymentMethod *string   `json:"paymentMethod,omitempty" db:"payment_method"`
	PaymentStatus string    `json:"paymentStatus" db:"payment_status"`
	TransactionID *string   `json:"transactionId,omitempty" db:"transaction_id"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	
	// Joined fields
	Buyer  *User `json:"buyer,omitempty"`
	Seller *User `json:"seller,omitempty"`
}

// Review system
type Review struct {
	ID                 string    `json:"id" db:"id"`
	UserID             string    `json:"userId" db:"user_id"`
	ReviewableType     string    `json:"reviewableType" db:"reviewable_type"`
	ReviewableID       string    `json:"reviewableId" db:"reviewable_id"`
	Rating             int       `json:"rating" db:"rating"`
	Title              *string   `json:"title,omitempty" db:"title"`
	Content            *string   `json:"content,omitempty" db:"content"`
	IsVerifiedPurchase bool      `json:"isVerifiedPurchase" db:"is_verified_purchase"`
	HelpfulCount       int       `json:"helpfulCount" db:"helpful_count"`
	CreatedAt          time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt          time.Time `json:"updatedAt" db:"updated_at"`
	
	// Joined fields
	User      *User `json:"user,omitempty"`
	IsHelpful bool  `json:"isHelpful,omitempty"`
}

// Notification system
type Notification struct {
	ID        string                 `json:"id" db:"id"`
	UserID    string                 `json:"userId" db:"user_id"`
	Type      string                 `json:"type" db:"type"`
	Title     string                 `json:"title" db:"title"`
	Message   *string                `json:"message,omitempty" db:"message"`
	Data      map[string]interface{} `json:"data,omitempty" db:"data"`
	IsRead    bool                   `json:"isRead" db:"is_read"`
	CreatedAt time.Time              `json:"createdAt" db:"created_at"`
	
	// Joined fields
	User *User `json:"user,omitempty"`
}

// Search and filter common structures
type SearchFilter struct {
	Query      *string   `json:"query,omitempty"`
	Categories []string  `json:"categories,omitempty"`
	Tags       []string  `json:"tags,omitempty"`
	UserIDs    []string  `json:"userIds,omitempty"`
	MinPrice   *float64  `json:"minPrice,omitempty"`
	MaxPrice   *float64  `json:"maxPrice,omitempty"`
	IsFree     *bool     `json:"isFree,omitempty"`
	IsVerified *bool     `json:"isVerified,omitempty"`
	DateFrom   *time.Time `json:"dateFrom,omitempty"`
	DateTo     *time.Time `json:"dateTo,omitempty"`
	Limit      int       `json:"limit"`
	Offset     int       `json:"offset"`
	SortBy     string    `json:"sortBy"`
	SortOrder  string    `json:"sortOrder"`
}

// Dashboard statistics
type DashboardStats struct {
	TotalUsers       int                    `json:"totalUsers"`
	TotalPosts       int                    `json:"totalPosts"`
	TotalProducts    int                    `json:"totalProducts"`
	TotalCourses     int                    `json:"totalCourses"`
	TotalRevenue     float64                `json:"totalRevenue"`
	MonthlyRevenue   float64                `json:"monthlyRevenue"`
	RecentActivity   []interface{}          `json:"recentActivity"`
	PopularContent   []interface{}          `json:"popularContent"`
	UserGrowth       map[string]interface{} `json:"userGrowth"`
	RevenueChart     map[string]interface{} `json:"revenueChart"`
}

// File upload response
type FileUploadResponse struct {
	URL       string `json:"url"`
	FileName  string `json:"fileName"`
	FileSize  int64  `json:"fileSize"`
	MimeType  string `json:"mimeType"`
	PublicID  string `json:"publicId,omitempty"`
}