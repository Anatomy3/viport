package main

import (
	"log"
	"time"
	"viport-backend/internal/config"
	"viport-backend/internal/handlers"
	"viport-backend/internal/middleware"
	"viport-backend/pkg/auth"
	"viport-backend/pkg/database"
	"viport-backend/pkg/logger"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger := logger.New(cfg.LogLevel)

	// Initialize database connection
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		logger.Error("Failed to connect to database: " + err.Error())
		logger.Info("Running without database - using dummy data")
		db = nil
	}
	if db != nil {
		defer db.Close()
	}

	// Initialize JWT manager
	jwtManager := auth.NewJWTManager(cfg.JWTSecret, 1*time.Hour)

	// Initialize handlers with database connection
	authHandler := handlers.NewAuthHandler(db, logger, jwtManager)
	userHandler := handlers.NewUserHandler(db, logger)
	postHandler := handlers.NewPostHandler(db, logger)
	productHandler := handlers.NewProductHandler(db, logger)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Global middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.RateLimitMiddleware(100, 1*time.Minute)) // 100 requests per minute

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":   "ok",
			"service":  "viport-backend",
			"version":  "1.0.0",
			"features": []string{"feed", "marketplace", "courses", "portfolios"},
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Authentication routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/google", authHandler.GoogleAuth)
			auth.POST("/google/callback", authHandler.GoogleAuthCallback)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// User routes
		users := api.Group("/users")
		{
			// Public routes
			users.GET("", userHandler.GetUsers)
			users.GET("/:id", userHandler.GetUser)
			
			// Protected routes
			users.Use(middleware.AuthMiddleware(jwtManager))
			users.GET("/me", authHandler.GetProfile)
			users.PUT("/me", authHandler.UpdateProfile)
			users.POST("", userHandler.CreateUser)
			users.PUT("/:id", userHandler.UpdateUser)
			users.DELETE("/:id", userHandler.DeleteUser)
		}

		// Posts routes (Instagram-like feed)
		posts := api.Group("/posts")
		{
			// Public routes
			posts.GET("", middleware.OptionalAuthMiddleware(jwtManager), postHandler.GetFeed)
			posts.GET("/:id", middleware.OptionalAuthMiddleware(jwtManager), postHandler.GetPost)
			posts.GET("/:id/comments", middleware.OptionalAuthMiddleware(jwtManager), postHandler.GetPostComments)
			
			// Protected routes
			posts.Use(middleware.AuthMiddleware(jwtManager))
			posts.POST("", postHandler.CreatePost)
			posts.PUT("/:id", postHandler.UpdatePost)
			posts.DELETE("/:id", postHandler.DeletePost)
			posts.POST("/:id/like", postHandler.LikePost)
			posts.DELETE("/:id/like", postHandler.UnlikePost)
		}

		// Products routes (Digital Marketplace)
		products := api.Group("/products")
		{
			// Public routes
			products.GET("", middleware.OptionalAuthMiddleware(jwtManager), productHandler.GetProducts)
			products.GET("/categories", productHandler.GetCategories)
			products.GET("/:id", middleware.OptionalAuthMiddleware(jwtManager), productHandler.GetProduct)
			
			// Protected routes
			products.Use(middleware.AuthMiddleware(jwtManager))
			products.POST("", middleware.CreatorOnlyMiddleware(), productHandler.CreateProduct)
			products.PUT("/:id", productHandler.UpdateProduct)
			products.DELETE("/:id", productHandler.DeleteProduct)
			products.POST("/:id/purchase", productHandler.PurchaseProduct)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(jwtManager))
		admin.Use(middleware.AdminOnlyMiddleware())
		{
			admin.GET("/stats", func(c *gin.Context) {
				c.JSON(200, gin.H{
					"totalUsers":    1250,
					"totalPosts":    5670,
					"totalProducts": 890,
					"totalRevenue":  125000.50,
				})
			})
		}
	}

	logger.Info("Server starting on port " + cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}