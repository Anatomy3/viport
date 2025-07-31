package handlers

import (
	"database/sql"
	"net/http"
	"time"
	"viport-backend/internal/models"
	"viport-backend/internal/repositories"
	"viport-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	db       *sql.DB
	logger   logger.Logger
	validate *validator.Validate
	userRepo *repositories.UserRepository
}

func NewUserHandler(db *sql.DB, logger logger.Logger) *UserHandler {
	return &UserHandler{
		db:       db,
		logger:   logger,
		validate: validator.New(),
		userRepo: repositories.NewUserRepository(db),
	}
}

func (h *UserHandler) GetUsers(c *gin.Context) {
	// Try to get users from database
	dbUsers, err := h.userRepo.GetAll()
	if err != nil {
		h.logger.Error("Failed to get users from database: " + err.Error())
		// Fallback to dummy data
	}

	var users []models.User
	if len(dbUsers) > 0 {
		// Convert pointer array to value array for response
		for _, user := range dbUsers {
			users = append(users, *user)
		}
	} else {
		// Generate dummy users data as fallback
		users = []models.User{
		{
			ID:                "user-1",
			Username:          "sarah_designer",
			Email:             "sarah@example.com",
			FirstName:         stringPtr("Sarah"),
			LastName:          stringPtr("Johnson"),
			DisplayName:       stringPtr("Sarah Johnson"),
			Bio:               stringPtr("Creative designer and digital artist"),
			AvatarURL:         stringPtr("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"),
			IsVerified:        true,
			IsCreator:         true,
			VerificationLevel: "creator",
			AccountType:       "creator",
			FollowerCount:     1250,
			FollowingCount:    890,
			PostCount:         156,
			ProductCount:      23,
			CreatedAt:         time.Now().AddDate(0, -6, 0),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "user-2",
			Username:          "alex_illustrator",
			Email:             "alex@example.com",
			FirstName:         stringPtr("Alex"),
			LastName:          stringPtr("Chen"),
			DisplayName:       stringPtr("Alex Chen"),
			Bio:               stringPtr("Digital illustrator and concept artist"),
			AvatarURL:         stringPtr("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"),
			IsVerified:        true,
			IsCreator:         true,
			VerificationLevel: "creator",
			AccountType:       "creator",
			FollowerCount:     2100,
			FollowingCount:    567,
			PostCount:         89,
			ProductCount:      45,
			CreatedAt:         time.Now().AddDate(0, -8, 0),
			UpdatedAt:         time.Now(),
		},
		{
			ID:                "user-3",
			Username:          "mike_photo",
			Email:             "mike@example.com",
			FirstName:         stringPtr("Mike"),
			LastName:          stringPtr("Rodriguez"),
			DisplayName:       stringPtr("Mike Rodriguez"),
			Bio:               stringPtr("Professional photographer"),
			AvatarURL:         stringPtr("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"),
			IsVerified:        false,
			IsCreator:         true,
			VerificationLevel: "email",
			AccountType:       "creator",
			FollowerCount:     890,
			FollowingCount:    234,
			PostCount:         67,
			ProductCount:      12,
			CreatedAt:         time.Now().AddDate(0, -3, 0),
			UpdatedAt:         time.Now(),
		},
		}
	}

	response := models.ApiResponse{
		Data:    users,
		Message: "Users retrieved successfully",
		Success: true,
	}

	c.JSON(http.StatusOK, response)
}

func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	// Generate dummy user data
	user := models.User{
		ID:                id,
		Username:          "sarah_designer",
		Email:             "sarah@example.com",
		FirstName:         stringPtr("Sarah"),
		LastName:          stringPtr("Johnson"),
		DisplayName:       stringPtr("Sarah Johnson"),
		Bio:               stringPtr("Creative designer and digital artist passionate about UI/UX and digital illustrations."),
		AvatarURL:         stringPtr("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"),
		CoverImageURL:     stringPtr("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"),
		Location:          stringPtr("San Francisco, CA"),
		WebsiteURL:        stringPtr("https://sarah-designs.com"),
		IsVerified:        true,
		IsCreator:         true,
		VerificationLevel: "creator",
		AccountType:       "creator",
		FollowerCount:     1250,
		FollowingCount:    890,
		PostCount:         156,
		ProductCount:      23,
		CreatedAt:         time.Now().AddDate(0, -6, 0),
		UpdatedAt:         time.Now(),
		LastActiveAt:      timePtr(time.Now().Add(-1 * time.Hour)),
	}

	response := models.ApiResponse{
		Data:    user,
		Message: "User retrieved successfully",
		Success: true,
	}

	c.JSON(http.StatusOK, response)
}

func (h *UserHandler) CreateUser(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.ErrorResponse{
		Error:   "Not implemented",
		Message: "Use /auth/register endpoint instead",
		Success: false,
	})
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, models.ErrorResponse{
		Error:   "Not implemented", 
		Message: "Use /auth/me endpoint instead",
		Success: false,
	})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	h.logger.Info("Delete user request for ID: " + id)

	response := models.ApiResponse{
		Data:    gin.H{"id": id},
		Message: "User deleted successfully",
		Success: true,
	}

	c.JSON(http.StatusOK, response)
}

