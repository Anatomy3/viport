package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"
	"viport-backend/internal/models"
	"viport-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type ProductHandler struct {
	db       *sql.DB
	logger   logger.Logger
	validate *validator.Validate
}

func NewProductHandler(db *sql.DB, logger logger.Logger) *ProductHandler {
	return &ProductHandler{
		db:       db,
		logger:   logger,
		validate: validator.New(),
	}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	categoryID := c.Query("categoryId")
	minPriceStr := c.Query("minPrice")
	maxPriceStr := c.Query("maxPrice")
	isFreeStr := c.Query("isFree")
	search := c.Query("search")
	sortBy := c.DefaultQuery("sortBy", "created_at")
	sortOrder := c.DefaultQuery("sortOrder", "desc")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	var minPrice, maxPrice *float64
	if minPriceStr != "" {
		if mp, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			minPrice = &mp
		}
	}
	if maxPriceStr != "" {
		if mp, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			maxPrice = &mp
		}
	}

	var isFree *bool
	if isFreeStr != "" {
		if free, err := strconv.ParseBool(isFreeStr); err == nil {
			isFree = &free
		}
	}

	// Get current user ID if authenticated
	var currentUserID string
	if userID, exists := c.Get("userID"); exists {
		currentUserID = userID.(string)
	}

	// Generate dummy products
	products := h.generateDummyProducts(limit, offset, categoryID, minPrice, maxPrice, isFree, search, sortBy, sortOrder, currentUserID)

	meta := &models.Meta{
		Page:        (offset / limit) + 1,
		Limit:       limit,
		Total:       250, // dummy total
		TotalPages:  13,  // dummy total pages
		HasNext:     offset + limit < 250,
		HasPrevious: offset > 0,
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    products,
		Message: "Products retrieved successfully",
		Success: true,
		Meta:    meta,
	})
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	productID := c.Param("id")
	if productID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Product ID is required",
			Success: false,
		})
		return
	}

	// Get current user ID if authenticated
	var currentUserID string
	if userID, exists := c.Get("userID"); exists {
		currentUserID = userID.(string)
	}

	// Generate dummy product
	product := h.generateDummyProduct(productID, currentUserID)

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    product,
		Message: "Product retrieved successfully",
		Success: true,
	})
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request data",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	if err := h.validate.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Validation failed",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	// Create product
	productID := uuid.New().String()
	now := time.Now()

	product := models.Product{
		ID:               productID,
		UserID:           userID.(string),
		CategoryID:       req.CategoryID,
		Title:            req.Title,
		Description:      req.Description,
		ShortDescription: req.ShortDescription,
		ThumbnailURL:     req.ThumbnailURL,
		DemoURL:          req.DemoURL,
		Price:            req.Price,
		OriginalPrice:    req.OriginalPrice,
		IsFree:           req.IsFree,
		LicenseType:      req.LicenseType,
		FileSize:         req.FileSize,
		FileFormat:       req.FileFormat,
		Compatibility:    req.Compatibility,
		Requirements:     req.Requirements,
		Status:           "draft",
		CreatedAt:        now,
		UpdatedAt:        now,
		User: &models.User{
			ID:          userID.(string),
			Username:    "johndoe",
			DisplayName: stringPtr("John Doe"),
			AvatarURL:   stringPtr("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"),
			IsVerified:  true,
			IsCreator:   true,
		},
	}

	h.logger.Info("Creating product for user: " + userID.(string))

	c.JSON(http.StatusCreated, models.ApiResponse{
		Data:    product,
		Message: "Product created successfully",
		Success: true,
	})
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	productID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request data",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	// For demo, just return success
	h.logger.Info("Updating product " + productID + " for user: " + userID.(string))

	product := h.generateDummyProduct(productID, userID.(string))

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    product,
		Message: "Product updated successfully",
		Success: true,
	})
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	productID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	h.logger.Info("Deleting product " + productID + " for user: " + userID.(string))

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    gin.H{"id": productID},
		Message: "Product deleted successfully",
		Success: true,
	})
}

func (h *ProductHandler) PurchaseProduct(c *gin.Context) {
	productID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	var req struct {
		PaymentMethod string `json:"paymentMethod" validate:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request data",
			Success: false,
		})
		return
	}

	// Simulate purchase process
	transactionID := uuid.New().String()
	
	transaction := models.Transaction{
		ID:            transactionID,
		BuyerID:       userID.(string),
		SellerID:      "seller-user-id",
		ItemType:      "product",
		ItemID:        productID,
		Amount:        29.99,
		FeeAmount:     2.99,
		NetAmount:     27.00,
		Currency:      "USD",
		PaymentMethod: &req.PaymentMethod,
		PaymentStatus: "completed",
		TransactionID: &transactionID,
		CreatedAt:     time.Now(),
	}

	h.logger.Info("User " + userID.(string) + " purchased product: " + productID)

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    transaction,
		Message: "Product purchased successfully",
		Success: true,
	})
}

func (h *ProductHandler) GetCategories(c *gin.Context) {
	// Generate dummy categories
	categories := []models.Category{
		{
			ID:          "cat-1",
			Name:        "Web Templates",
			Slug:        "web-templates",
			Description: stringPtr("Modern and responsive web templates"),
			Icon:        stringPtr("globe"),
			Color:       stringPtr("#3B82F6"),
			IsActive:    true,
			SortOrder:   1,
			ItemCount:   45,
		},
		{
			ID:          "cat-2",
			Name:        "UI/UX Kits",
			Slug:        "ui-ux-kits",
			Description: stringPtr("Complete UI and UX design systems"),
			Icon:        stringPtr("palette"),
			Color:       stringPtr("#8B5CF6"),
			IsActive:    true,
			SortOrder:   2,
			ItemCount:   32,
		},
		{
			ID:          "cat-3",
			Name:        "Graphics & Illustrations",
			Slug:        "graphics-illustrations",
			Description: stringPtr("Vector graphics and digital illustrations"),
			Icon:        stringPtr("image"),
			Color:       stringPtr("#F59E0B"),
			IsActive:    true,
			SortOrder:   3,
			ItemCount:   67,
		},
		{
			ID:          "cat-4",
			Name:        "3D Assets",
			Slug:        "3d-assets",
			Description: stringPtr("3D models, textures, and animations"),
			Icon:        stringPtr("cube"),
			Color:       stringPtr("#EF4444"),
			IsActive:    true,
			SortOrder:   4,
			ItemCount:   28,
		},
		{
			ID:          "cat-5",
			Name:        "Audio & Music",
			Slug:        "audio-music",
			Description: stringPtr("Sound effects, music tracks, and audio tools"),
			Icon:        stringPtr("music"),
			Color:       stringPtr("#10B981"),
			IsActive:    true,
			SortOrder:   5,
			ItemCount:   53,
		},
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    categories,
		Message: "Categories retrieved successfully",
		Success: true,
	})
}

// Helper functions for dummy data
func (h *ProductHandler) generateDummyProducts(limit, offset int, categoryID string, minPrice, maxPrice *float64, isFree *bool, search, sortBy, sortOrder, currentUserID string) []models.Product {
	products := []models.Product{}

	// Sample product data
	sampleProducts := []struct {
		title            string
		description      string
		shortDescription string
		thumbnailURL     string
		price            float64
		originalPrice    *float64
		isFree           bool
		licenseType      string
		fileFormat       string
		downloadCount    int
		rating           float64
		ratingCount      int
		user             models.User
		category         models.Category
	}{
		{
			title:            "Modern Dashboard UI Kit",
			description:      "Complete UI kit for modern dashboard applications with 50+ components, dark/light themes, and Figma source files included.",
			shortDescription: "Complete dashboard UI kit with 50+ components",
			thumbnailURL:     "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
			price:            49.99,
			originalPrice:    floatPtr(79.99),
			isFree:           false,
			licenseType:      "commercial",
			fileFormat:       "Figma, Sketch, XD",
			downloadCount:    342,
			rating:           4.8,
			ratingCount:      67,
			user: models.User{
				ID:          "creator-1",
				Username:    "design_master",
				DisplayName: stringPtr("Alex Rivera"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"),
				IsVerified:  true,
				IsCreator:   true,
			},
			category: models.Category{
				ID:   "cat-2",
				Name: "UI/UX Kits",
				Slug: "ui-ux-kits",
			},
		},
		{
			title:            "E-commerce Website Template",
			description:      "Fully responsive e-commerce website template built with React and Next.js. Includes shopping cart, product pages, checkout flow, and admin dashboard.",
			shortDescription: "Responsive e-commerce template with React/Next.js",
			thumbnailURL:     "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
			price:            89.99,
			originalPrice:    floatPtr(129.99),
			isFree:           false,
			licenseType:      "commercial",
			fileFormat:       "HTML, CSS, JS, React",
			downloadCount:    156,
			rating:           4.9,
			ratingCount:      23,
			user: models.User{
				ID:          "creator-2",
				Username:    "web_wizard",
				DisplayName: stringPtr("Sarah Chen"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"),
				IsVerified:  true,
				IsCreator:   true,
			},
			category: models.Category{
				ID:   "cat-1",
				Name: "Web Templates",
				Slug: "web-templates",
			},
		},
		{
			title:            "Free Icon Pack Collection",
			description:      "Beautiful collection of 200+ icons in multiple formats. Perfect for web and mobile applications. Includes business, technology, and lifestyle icons.",
			shortDescription: "200+ icons in multiple formats - Free download",
			thumbnailURL:     "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400",
			price:            0.00,
			originalPrice:    nil,
			isFree:           true,
			licenseType:      "standard",
			fileFormat:       "SVG, PNG, ICO",
			downloadCount:    1250,
			rating:           4.6,
			ratingCount:      189,
			user: models.User{
				ID:          "creator-3",
				Username:    "icon_artist",
				DisplayName: stringPtr("Mike Johnson"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"),
				IsVerified:  false,
				IsCreator:   true,
			},
			category: models.Category{
				ID:   "cat-3",
				Name: "Graphics & Illustrations",
				Slug: "graphics-illustrations",
			},
		},
		{
			title:            "3D Character Models Pack",
			description:      "High-quality 3D character models for games and animations. Includes rigged characters with multiple animations and texture variations.",
			shortDescription: "High-quality 3D characters with animations",
			thumbnailURL:     "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
			price:            199.99,
			originalPrice:    floatPtr(299.99),
			isFree:           false,
			licenseType:      "commercial",
			fileFormat:       "FBX, OBJ, Blend",
			downloadCount:    89,
			rating:           4.7,
			ratingCount:      34,
			user: models.User{
				ID:          "creator-4",
				Username:    "3d_sculptor",
				DisplayName: stringPtr("Emma Wilson"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"),
				IsVerified:  true,
				IsCreator:   true,
			},
			category: models.Category{
				ID:   "cat-4",
				Name: "3D Assets",
				Slug: "3d-assets",
			},
		},
		{
			title:            "Ambient Music Collection",
			description:      "Royalty-free ambient music tracks perfect for videos, games, and meditation apps. 10 high-quality tracks in WAV and MP3 formats.",
			shortDescription: "10 royalty-free ambient music tracks",
			thumbnailURL:     "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
			price:            29.99,
			originalPrice:    nil,
			isFree:           false,
			licenseType:      "commercial",
			fileFormat:       "WAV, MP3",
			downloadCount:    78,
			rating:           4.5,
			ratingCount:      12,
			user: models.User{
				ID:          "creator-5",
				Username:    "sound_creator",
				DisplayName: stringPtr("David Kim"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"),
				IsVerified:  false,
				IsCreator:   true,
			},
			category: models.Category{
				ID:   "cat-5",
				Name: "Audio & Music",
				Slug: "audio-music",
			},
		},
	}

	// Filter and generate products
	for i := 0; i < limit && (offset+i) < len(sampleProducts)*10; i++ {
		productIndex := (offset + i) % len(sampleProducts)
		sample := sampleProducts[productIndex]

		// Apply filters
		if categoryID != "" && sample.category.ID != categoryID {
			continue
		}
		if minPrice != nil && sample.price < *minPrice {
			continue
		}
		if maxPrice != nil && sample.price > *maxPrice {
			continue
		}
		if isFree != nil && sample.isFree != *isFree {
			continue
		}
		if search != "" {
			// Simple search implementation
			// In real implementation, use full-text search
			continue
		}

		productID := uuid.New().String()
		product := models.Product{
			ID:               productID,
			UserID:           sample.user.ID,
			CategoryID:       &sample.category.ID,
			Title:            sample.title,
			Description:      &sample.description,
			ShortDescription: &sample.shortDescription,
			ThumbnailURL:     &sample.thumbnailURL,
			Price:            sample.price,
			OriginalPrice:    sample.originalPrice,
			IsFree:           sample.isFree,
			LicenseType:      sample.licenseType,
			FileFormat:       &sample.fileFormat,
			Status:           "active",
			DownloadCount:    sample.downloadCount + (i * 5),
			RatingAverage:    sample.rating,
			RatingCount:      sample.ratingCount + i,
			CreatedAt:        time.Now().Add(-time.Duration(i*12) * time.Hour),
			UpdatedAt:        time.Now().Add(-time.Duration(i*6) * time.Hour),
			User:             &sample.user,
			Category:         &sample.category,
			IsLiked:          currentUserID == sample.user.ID || (i%4 == 0),
			IsPurchased:      currentUserID == sample.user.ID || (i%7 == 0),
			IsInWishlist:     i%5 == 0,
		}

		products = append(products, product)
	}

	return products
}

func (h *ProductHandler) generateDummyProduct(productID, currentUserID string) models.Product {
	return models.Product{
		ID:               productID,
		UserID:           "creator-1",
		CategoryID:       stringPtr("cat-2"),
		Title:            "Premium Dashboard UI Kit",
		Description:      stringPtr("Complete premium UI kit for dashboard applications with 100+ components, multiple themes, and comprehensive documentation. Built with modern design principles and best practices."),
		ShortDescription: stringPtr("Premium dashboard UI kit with 100+ components"),
		ThumbnailURL:     stringPtr("https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600"),
		Price:            79.99,
		OriginalPrice:    floatPtr(119.99),
		IsFree:           false,
		LicenseType:      "commercial",
		FileSize:         stringPtr("45 MB"),
		FileFormat:       stringPtr("Figma, Sketch, XD, PDF"),
		Compatibility:    stringPtr("Figma 2020+, Sketch 70+, Adobe XD"),
		Requirements:     stringPtr("Modern design tool with component support"),
		Status:           "active",
		DownloadCount:    567,
		RatingAverage:    4.8,
		RatingCount:      89,
		CreatedAt:        time.Now().Add(-30 * 24 * time.Hour),
		UpdatedAt:        time.Now().Add(-2 * 24 * time.Hour),
		User: &models.User{
			ID:          "creator-1",
			Username:    "design_master",
			DisplayName: stringPtr("Alex Rivera"),
			AvatarURL:   stringPtr("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"),
			IsVerified:  true,
			IsCreator:   true,
		},
		Category: &models.Category{
			ID:   "cat-2",
			Name: "UI/UX Kits",
			Slug: "ui-ux-kits",
		},
		IsLiked:      currentUserID == "creator-1" || productID == "liked-product",
		IsPurchased:  currentUserID == "creator-1",
		IsInWishlist: productID == "wishlist-product",
	}
}

func floatPtr(f float64) *float64 {
	return &f
}