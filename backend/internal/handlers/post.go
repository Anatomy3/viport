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

type PostHandler struct {
	db       *sql.DB
	logger   logger.Logger
	validate *validator.Validate
}

func NewPostHandler(db *sql.DB, logger logger.Logger) *PostHandler {
	return &PostHandler{
		db:       db,
		logger:   logger,
		validate: validator.New(),
	}
}

func (h *PostHandler) GetFeed(c *gin.Context) {
	// Parse query parameters
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	mediaType := c.Query("mediaType")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 20
	}
	
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get current user ID if authenticated
	var currentUserID string
	if userID, exists := c.Get("userID"); exists {
		currentUserID = userID.(string)
	}

	// Generate dummy feed data
	posts := h.generateDummyPosts(limit, offset, mediaType, currentUserID)

	meta := &models.Meta{
		Page:        (offset / limit) + 1,
		Limit:       limit,
		Total:       500, // dummy total
		TotalPages:  25,  // dummy total pages
		HasNext:     offset + limit < 500,
		HasPrevious: offset > 0,
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    posts,
		Message: "Feed retrieved successfully",
		Success: true,
		Meta:    meta,
	})
}

func (h *PostHandler) GetPost(c *gin.Context) {
	postID := c.Param("id")
	if postID == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Post ID is required",
			Success: false,
		})
		return
	}

	// Get current user ID if authenticated
	var currentUserID string
	if userID, exists := c.Get("userID"); exists {
		currentUserID = userID.(string)
	}

	// Generate dummy post
	post := h.generateDummyPost(postID, currentUserID)

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    post,
		Message: "Post retrieved successfully",
		Success: true,
	})
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	var req models.CreatePostRequest
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

	// Create post
	postID := uuid.New().String()
	now := time.Now()

	post := models.Post{
		ID:        postID,
		UserID:    userID.(string),
		Title:     req.Title,
		Content:   req.Content,
		MediaType: req.MediaType,
		Visibility: req.Visibility,
		CreatedAt: now,
		UpdatedAt: now,
		User: &models.User{
			ID:          userID.(string),
			Username:    "johndoe",
			DisplayName: stringPtr("John Doe"),
			AvatarURL:   stringPtr("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"),
			IsVerified:  true,
		},
	}

	h.logger.Info("Creating post for user: " + userID.(string))

	c.JSON(http.StatusCreated, models.ApiResponse{
		Data:    post,
		Message: "Post created successfully",
		Success: true,
	})
}

func (h *PostHandler) UpdatePost(c *gin.Context) {
	postID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	var req models.UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request data",
			Message: err.Error(),
			Success: false,
		})
		return
	}

	// For demo, just return success
	h.logger.Info("Updating post " + postID + " for user: " + userID.(string))

	post := h.generateDummyPost(postID, userID.(string))

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    post,
		Message: "Post updated successfully",
		Success: true,
	})
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	postID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	h.logger.Info("Deleting post " + postID + " for user: " + userID.(string))

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    gin.H{"id": postID},
		Message: "Post deleted successfully",
		Success: true,
	})
}

func (h *PostHandler) LikePost(c *gin.Context) {
	postID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	h.logger.Info("User " + userID.(string) + " liked post: " + postID)

	c.JSON(http.StatusOK, models.ApiResponse{
		Data: gin.H{
			"postId":    postID,
			"isLiked":   true,
			"likeCount": 126, // dummy count
		},
		Message: "Post liked successfully",
		Success: true,
	})
}

func (h *PostHandler) UnlikePost(c *gin.Context) {
	postID := c.Param("id")
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication required",
			Success: false,
		})
		return
	}

	h.logger.Info("User " + userID.(string) + " unliked post: " + postID)

	c.JSON(http.StatusOK, models.ApiResponse{
		Data: gin.H{
			"postId":    postID,
			"isLiked":   false,
			"likeCount": 124, // dummy count
		},
		Message: "Post unliked successfully",
		Success: true,
	})
}

func (h *PostHandler) GetPostComments(c *gin.Context) {
	postID := c.Param("id")
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	offset, _ := strconv.Atoi(offsetStr)
	if offset < 0 {
		offset = 0
	}

	// Generate dummy comments
	comments := h.generateDummyComments(postID, limit, offset)

	meta := &models.Meta{
		Page:        (offset / limit) + 1,
		Limit:       limit,
		Total:       50, // dummy total
		TotalPages:  3,  // dummy total pages
		HasNext:     offset + limit < 50,
		HasPrevious: offset > 0,
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    comments,
		Message: "Comments retrieved successfully",
		Success: true,
		Meta:    meta,
	})
}

// Helper functions for dummy data
func (h *PostHandler) generateDummyPosts(limit, offset int, mediaType, currentUserID string) []models.Post {
	posts := []models.Post{}
	
	// Sample post data
	samplePosts := []struct {
		title     string
		content   string
		mediaType string
		mediaUrls []string
		user      models.User
		stats     struct{ likes, comments, views int }
	}{
		{
			title:     stringPtrToString(stringPtr("New UI Design System")),
			content:   stringPtrToString(stringPtr("Just finished working on this comprehensive design system for modern web apps. What do you think? 🎨")),
			mediaType: "image",
			mediaUrls: []string{
				"https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600",
				"https://images.unsplash.com/photo-1558655146-d09347e92766?w=600",
			},
			user: models.User{
				ID:          "user-1",
				Username:    "sarah_designer",
				DisplayName: stringPtr("Sarah Johnson"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"),
				IsVerified:  true,
				IsCreator:   true,
			},
			stats: struct{ likes, comments, views int }{likes: 342, comments: 28, views: 1250},
		},
		{
			title:     stringPtrToString(stringPtr("Creative Process Behind My Latest Illustration")),
			content:   stringPtrToString(stringPtr("Here's a time-lapse of my latest digital illustration. This piece took about 8 hours to complete. The inspiration came from urban architecture and nature fusion.")),
			mediaType: "video",
			mediaUrls: []string{"https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"},
			user: models.User{
				ID:          "user-2",
				Username:    "alex_illustrator",
				DisplayName: stringPtr("Alex Chen"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"),
				IsVerified:  true,
				IsCreator:   true,
			},
			stats: struct{ likes, comments, views int }{likes: 567, comments: 45, views: 2100},
		},
		{
			title:     stringPtrToString(stringPtr("Photography Tips for Beginners")),
			content:   stringPtrToString(stringPtr("5 essential tips that will instantly improve your photography:\n\n1. Rule of thirds\n2. Golden hour lighting\n3. Focus on composition\n4. Understand your camera settings\n5. Practice, practice, practice!\n\nWhat's your biggest photography challenge? 📸")),
			mediaType: "mixed",
			mediaUrls: []string{
				"https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600",
				"https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600",
				"https://images.unsplash.com/photo-1515041219749-89347f83291a?w=600",
			},
			user: models.User{
				ID:          "user-3",
				Username:    "mike_photo",
				DisplayName: stringPtr("Mike Rodriguez"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"),
				IsVerified:  false,
				IsCreator:   true,
			},
			stats: struct{ likes, comments, views int }{likes: 234, comments: 67, views: 890},
		},
	}

	// Generate posts based on offset and limit
	for i := 0; i < limit && (offset+i) < len(samplePosts)*5; i++ {
		postIndex := (offset + i) % len(samplePosts)
		sample := samplePosts[postIndex]
		
		// Skip if mediaType filter doesn't match
		if mediaType != "" && sample.mediaType != mediaType {
			continue
		}

		postID := uuid.New().String()
		post := models.Post{
			ID:           postID,
			UserID:       sample.user.ID,
			Title:        &sample.title,
			Content:      &sample.content,
			MediaType:    sample.mediaType,
			Visibility:   "public",
			LikeCount:    sample.stats.likes + i,
			CommentCount: sample.stats.comments + (i % 10),
			ViewCount:    sample.stats.views + (i * 50),
			CreatedAt:    time.Now().Add(-time.Duration(i*3) * time.Hour),
			UpdatedAt:    time.Now().Add(-time.Duration(i*2) * time.Hour),
			User:         &sample.user,
			IsLiked:      currentUserID == sample.user.ID || (i%3 == 0),
		}

		posts = append(posts, post)
	}

	return posts
}

func (h *PostHandler) generateDummyPost(postID, currentUserID string) models.Post {
	return models.Post{
		ID:      postID,
		UserID:  "user-1",
		Title:   stringPtr("Amazing Digital Art Piece"),
		Content: stringPtr("Just completed this digital artwork after 12 hours of work. The piece explores the intersection of technology and nature. I used Photoshop and Procreate for this creation. Hope you like it! 🎨✨"),
		MediaType: "image",
		Visibility: "public",
		LikeCount: 456,
		CommentCount: 23,
		ViewCount: 1890,
		CreatedAt: time.Now().Add(-2 * time.Hour),
		UpdatedAt: time.Now().Add(-1 * time.Hour),
		User: &models.User{
			ID:          "user-1",
			Username:    "sarah_designer",
			DisplayName: stringPtr("Sarah Johnson"),
			AvatarURL:   stringPtr("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"),
			IsVerified:  true,
			IsCreator:   true,
		},
		IsLiked: currentUserID == "user-1" || postID == "liked-post",
	}
}

func (h *PostHandler) generateDummyComments(postID string, limit, offset int) []models.Comment {
	comments := []models.Comment{}
	
	sampleComments := []struct {
		content string
		user    models.User
		likes   int
	}{
		{
			content: "This is absolutely stunning! Love the color palette 😍",
			user: models.User{
				ID:          "commenter-1",
				Username:    "emma_art",
				DisplayName: stringPtr("Emma Wilson"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"),
				IsVerified:  false,
			},
			likes: 12,
		},
		{
			content: "Amazing work! Can you share some tips about your creative process?",
			user: models.User{
				ID:          "commenter-2",
				Username:    "design_lover",
				DisplayName: stringPtr("David Kim"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"),
				IsVerified:  true,
			},
			likes: 8,
		},
		{
			content: "Your style keeps getting better and better! Inspiring work 🔥",
			user: models.User{
				ID:          "commenter-3",
				Username:    "creative_mind",
				DisplayName: stringPtr("Lisa Chen"),
				AvatarURL:   stringPtr("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"),
				IsVerified:  false,
			},
			likes: 5,
		},
	}

	for i := 0; i < limit && (offset+i) < len(sampleComments)*3; i++ {
		commentIndex := (offset + i) % len(sampleComments)
		sample := sampleComments[commentIndex]
		
		commentID := uuid.New().String()
		comment := models.Comment{
			ID:              commentID,
			UserID:          sample.user.ID,
			CommentableType: "post",
			CommentableID:   postID,
			Content:         sample.content,
			LikeCount:       sample.likes + (i % 5),
			CreatedAt:       time.Now().Add(-time.Duration(i*30) * time.Minute),
			UpdatedAt:       time.Now().Add(-time.Duration(i*20) * time.Minute),
			User:            &sample.user,
			IsLiked:         i%4 == 0,
		}

		comments = append(comments, comment)
	}

	return comments
}

func stringPtrToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}