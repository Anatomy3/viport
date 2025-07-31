package models

import (
	"encoding/json"
	"time"
)

type Product struct {
	ID               string          `json:"id" db:"id"`
	UserID           string          `json:"userId" db:"user_id"`
	CategoryID       *string         `json:"categoryId,omitempty" db:"category_id"`
	Title            string          `json:"title" db:"title"`
	Description      *string         `json:"description,omitempty" db:"description"`
	ShortDescription *string         `json:"shortDescription,omitempty" db:"short_description"`
	ThumbnailURL     *string         `json:"thumbnailUrl,omitempty" db:"thumbnail_url"`
	PreviewImages    json.RawMessage `json:"previewImages,omitempty" db:"preview_images"`
	FileURLs         json.RawMessage `json:"fileUrls,omitempty" db:"file_urls"`
	DemoURL          *string         `json:"demoUrl,omitempty" db:"demo_url"`
	Price            float64         `json:"price" db:"price"`
	OriginalPrice    *float64        `json:"originalPrice,omitempty" db:"original_price"`
	IsFree           bool            `json:"isFree" db:"is_free"`
	LicenseType      string          `json:"licenseType" db:"license_type"`
	FileSize         *string         `json:"fileSize,omitempty" db:"file_size"`
	FileFormat       *string         `json:"fileFormat,omitempty" db:"file_format"`
	Compatibility    *string         `json:"compatibility,omitempty" db:"compatibility"`
	Requirements     *string         `json:"requirements,omitempty" db:"requirements"`
	Status           string          `json:"status" db:"status"`
	DownloadCount    int             `json:"downloadCount" db:"download_count"`
	RatingAverage    float64         `json:"ratingAverage" db:"rating_average"`
	RatingCount      int             `json:"ratingCount" db:"rating_count"`
	CreatedAt        time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt        time.Time       `json:"updatedAt" db:"updated_at"`

	// Joined fields
	User         *User     `json:"user,omitempty"`
	Category     *Category `json:"category,omitempty"`
	Tags         []Tag     `json:"tags,omitempty"`
	IsLiked      bool      `json:"isLiked,omitempty"`
	IsPurchased  bool      `json:"isPurchased,omitempty"`
	IsInWishlist bool      `json:"isInWishlist,omitempty"`
}

type ProductFile struct {
	Name        string `json:"name"`
	URL         string `json:"url"`
	Size        int64  `json:"size"`
	Format      string `json:"format"`
	Description string `json:"description,omitempty"`
}

type CreateProductRequest struct {
	CategoryID       *string       `json:"categoryId,omitempty"`
	Title            string        `json:"title" validate:"required,min=3,max=255"`
	Description      *string       `json:"description,omitempty" validate:"omitempty,max=5000"`
	ShortDescription *string       `json:"shortDescription,omitempty" validate:"omitempty,max=500"`
	ThumbnailURL     *string       `json:"thumbnailUrl,omitempty" validate:"omitempty,url"`
	PreviewImages    []string      `json:"previewImages,omitempty"`
	FileURLs         []ProductFile `json:"fileUrls,omitempty"`
	DemoURL          *string       `json:"demoUrl,omitempty" validate:"omitempty,url"`
	Price            float64       `json:"price" validate:"min=0"`
	OriginalPrice    *float64      `json:"originalPrice,omitempty" validate:"omitempty,min=0"`
	IsFree           bool          `json:"isFree"`
	LicenseType      string        `json:"licenseType" validate:"oneof=standard extended commercial"`
	FileSize         *string       `json:"fileSize,omitempty"`
	FileFormat       *string       `json:"fileFormat,omitempty"`
	Compatibility    *string       `json:"compatibility,omitempty"`
	Requirements     *string       `json:"requirements,omitempty"`
	TagNames         []string      `json:"tagNames,omitempty"`
}

type UpdateProductRequest struct {
	CategoryID       *string       `json:"categoryId,omitempty"`
	Title            *string       `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Description      *string       `json:"description,omitempty" validate:"omitempty,max=5000"`
	ShortDescription *string       `json:"shortDescription,omitempty" validate:"omitempty,max=500"`
	ThumbnailURL     *string       `json:"thumbnailUrl,omitempty" validate:"omitempty,url"`
	PreviewImages    []string      `json:"previewImages,omitempty"`
	FileURLs         []ProductFile `json:"fileUrls,omitempty"`
	DemoURL          *string       `json:"demoUrl,omitempty" validate:"omitempty,url"`
	Price            *float64      `json:"price,omitempty" validate:"omitempty,min=0"`
	OriginalPrice    *float64      `json:"originalPrice,omitempty" validate:"omitempty,min=0"`
	IsFree           *bool         `json:"isFree,omitempty"`
	LicenseType      *string       `json:"licenseType,omitempty" validate:"omitempty,oneof=standard extended commercial"`
	FileSize         *string       `json:"fileSize,omitempty"`
	FileFormat       *string       `json:"fileFormat,omitempty"`
	Compatibility    *string       `json:"compatibility,omitempty"`
	Requirements     *string       `json:"requirements,omitempty"`
	Status           *string       `json:"status,omitempty" validate:"omitempty,oneof=draft pending active suspended"`
	TagNames         []string      `json:"tagNames,omitempty"`
}

type ProductFilter struct {
	UserID       *string   `json:"userId,omitempty"`
	CategoryID   *string   `json:"categoryId,omitempty"`
	Status       *string   `json:"status,omitempty"`
	IsFree       *bool     `json:"isFree,omitempty"`
	LicenseType  *string   `json:"licenseType,omitempty"`
	MinPrice     *float64  `json:"minPrice,omitempty"`
	MaxPrice     *float64  `json:"maxPrice,omitempty"`
	TagIDs       []string  `json:"tagIds,omitempty"`
	Search       *string   `json:"search,omitempty"`
	Limit        int       `json:"limit"`
	Offset       int       `json:"offset"`
	SortBy       string    `json:"sortBy"` // created_at, price, rating_average, download_count
	SortOrder    string    `json:"sortOrder"` // asc, desc
}