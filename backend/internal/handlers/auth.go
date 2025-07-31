package handlers

import (
	"database/sql"
	"net/http"
	"time"
	"viport-backend/internal/models"
	"viport-backend/internal/repositories"
	"viport-backend/pkg/auth"
	"viport-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type AuthHandler struct {
	db         *sql.DB
	logger     logger.Logger
	validate   *validator.Validate
	jwtManager *auth.JWTManager
	userRepo   *repositories.UserRepository
}

func NewAuthHandler(db *sql.DB, logger logger.Logger, jwtManager *auth.JWTManager) *AuthHandler {
	return &AuthHandler{
		db:         db,
		logger:     logger,
		validate:   validator.New(),
		jwtManager: jwtManager,
		userRepo:   repositories.NewUserRepository(db),
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest

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

	// Check if email already exists (only if database is connected)
	if h.userRepo.IsConnected() {
		if existingUser, _ := h.userRepo.GetByEmail(req.Email); existingUser != nil {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error:   "Email already registered",
				Message: "An account with this email already exists",
				Success: false,
			})
			return
		}

		// Check if username already exists
		if existingUser, _ := h.userRepo.GetByUsername(req.Username); existingUser != nil {
			c.JSON(http.StatusConflict, models.ErrorResponse{
				Error:   "Username already taken",
				Message: "This username is not available",
				Success: false,
			})
			return
		}
	}

	// Hash password
	hashedPassword, err := auth.GenerateFromPassword(req.Password, nil)
	if err != nil {
		h.logger.Error("Password hashing error: " + err.Error())
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Success: false,
		})
		return
	}

	// Create user
	user := models.User{
		Username:          req.Username,
		Email:             req.Email,
		PasswordHash:      hashedPassword,
		FirstName:         &req.FirstName,
		LastName:          &req.LastName,
		DisplayName:       stringPtr(req.FirstName + " " + req.LastName),
		AccountType:       req.AccountType,
		IsCreator:         req.AccountType == "creator",
		IsVerified:        false,
		VerificationLevel: "email",
	}

	// Insert user into database (if connected)
	if h.userRepo.IsConnected() {
		err = h.userRepo.Create(&user)
		if err != nil {
			h.logger.Error("Failed to create user: " + err.Error())
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "Internal server error",
				Success: false,
			})
			return
		}
		h.logger.Info("Created user in database: " + req.Email)
	} else {
		// Generate ID manually when not using database
		user.ID = uuid.New().String()
		user.CreatedAt = time.Now()
		user.UpdatedAt = time.Now()
		h.logger.Info("Created user (no database): " + req.Email)
	}

	// Generate tokens
	token, err := h.jwtManager.Generate(user.ID, req.Username, req.Email, "user", user.IsCreator)
	if err != nil {
		h.logger.Error("Token generation error: " + err.Error())
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Success: false,
		})
		return
	}

	refreshToken, err := h.jwtManager.GenerateRefreshToken(user.ID)
	if err != nil {
		h.logger.Error("Refresh token generation error: " + err.Error())
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Success: false,
		})
		return
	}

	// Remove sensitive data
	user.PasswordHash = ""

	response := models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    3600, // 1 hour
	}

	c.JSON(http.StatusCreated, models.ApiResponse{
		Data:    response,
		Message: "Account created successfully",
		Success: true,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest

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

	var user *models.User
	var err error

	// Try to get user from database first
	if h.userRepo.IsConnected() {
		user, err = h.userRepo.GetByEmail(req.Email)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, models.ErrorResponse{
					Error:   "Invalid credentials",
					Message: "Email or password is incorrect",
					Success: false,
				})
				return
			}
			h.logger.Error("Database error: " + err.Error())
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{
				Error:   "Internal server error",
				Success: false,
			})
			return
		}

		// Verify password
		match, err := auth.ComparePasswordAndHash(req.Password, user.PasswordHash)
		if err != nil || !match {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "Invalid credentials",
				Message: "Email or password is incorrect",
				Success: false,
			})
			return
		}

		// Update last active
		now := time.Now()
		user.LastActiveAt = &now
		h.userRepo.Update(user)
	} else {
		// Fallback to demo credentials when database is not available
		if req.Email == "john@example.com" && req.Password == "password123" {
			user = &models.User{
				ID:                "demo-user-id",
				Username:          "johndoe",
				Email:             req.Email,
				FirstName:         stringPtr("John"),
				LastName:          stringPtr("Doe"),
				DisplayName:       stringPtr("John Doe"),
				Bio:               stringPtr("Creative designer and digital artist"),
				AvatarURL:         stringPtr("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"),
				AccountType:       "creator",
				IsCreator:         true,
				IsVerified:        true,
				VerificationLevel: "creator",
				CreatedAt:         time.Now().AddDate(0, -6, 0),
				UpdatedAt:         time.Now(),
			}
		} else {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "Invalid credentials",
				Message: "Email or password is incorrect. Try john@example.com / password123",
				Success: false,
			})
			return
		}
	}

	// Generate tokens
	token, err := h.jwtManager.Generate(user.ID, user.Username, user.Email, "user", user.IsCreator)
	if err != nil {
		h.logger.Error("Token generation error: " + err.Error())
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Success: false,
		})
		return
	}

	refreshToken, err := h.jwtManager.GenerateRefreshToken(user.ID)
	if err != nil {
		h.logger.Error("Refresh token generation error: " + err.Error())
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Success: false,
		})
		return
	}

	// Remove password hash from response
	user.PasswordHash = ""

	response := models.AuthResponse{
		User:         *user,
		Token:        token,
		RefreshToken: refreshToken,
		ExpiresIn:    3600,
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    response,
		Message: "Login successful",
		Success: true,
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" validate:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request data",
			Success: false,
		})
		return
	}

	userID, err := h.jwtManager.VerifyRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Invalid refresh token",
			Success: false,
		})
		return
	}

	// Get user data (dummy for now)
	user := models.User{
		ID:        userID,
		Username:  "johndoe",
		Email:     "john@example.com",
		IsCreator: true,
	}

	// Generate new tokens
	token, err := h.jwtManager.Generate(userID, user.Username, user.Email, "user", user.IsCreator)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Success: false,
		})
		return
	}

	newRefreshToken, err := h.jwtManager.GenerateRefreshToken(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Success: false,
		})
		return
	}

	response := models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: newRefreshToken,
		ExpiresIn:    3600,
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    response,
		Message: "Token refreshed successfully",
		Success: true,
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	// Get user profile (dummy for now)
	user := models.User{
		ID:                userID.(string),
		Username:          "johndoe",
		Email:             "john@example.com",
		FirstName:         stringPtr("John"),
		LastName:          stringPtr("Doe"),
		DisplayName:       stringPtr("John Doe"),
		Bio:               stringPtr("Creative designer and digital artist passionate about UI/UX and digital illustrations."),
		AvatarURL:         stringPtr("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"),
		CoverImageURL:     stringPtr("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"),
		Location:          stringPtr("San Francisco, CA"),
		WebsiteURL:        stringPtr("https://johndoe.design"),
		AccountType:       "creator",
		IsCreator:         true,
		IsVerified:        true,
		VerificationLevel: "creator",
		FollowerCount:     1250,
		FollowingCount:    890,
		PostCount:         156,
		ProductCount:      23,
		CreatedAt:         time.Now().AddDate(0, -6, 0),
		UpdatedAt:         time.Now(),
		LastActiveAt:      timePtr(time.Now().Add(-1 * time.Hour)),
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    user,
		Message: "Profile retrieved successfully",
		Success: true,
	})
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	var req models.UpdateProfileRequest
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

	h.logger.Info("Updating profile for user: " + userID.(string))

	// Return updated user (dummy for now)
	user := models.User{
		ID:          userID.(string),
		Username:    "johndoe",
		Email:       "john@example.com",
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		DisplayName: req.DisplayName,
		Bio:         req.Bio,
		Location:    req.Location,
		WebsiteURL:  req.WebsiteURL,
		UpdatedAt:   time.Now(),
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    user,
		Message: "Profile updated successfully",
		Success: true,
	})
}

// Helper functions
func stringPtr(s string) *string {
	return &s
}

func timePtr(t time.Time) *time.Time {
	return &t
}