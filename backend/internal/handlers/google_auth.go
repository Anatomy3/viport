package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
	"viport-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// GoogleTokenInfo represents the response from Google's token info endpoint
type GoogleTokenInfo struct {
	ID            string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
}

// GoogleAuthRequest represents the request body for Google authentication
type GoogleAuthRequest struct {
	IDToken     string `json:"id_token,omitempty"`
	AccessToken string `json:"access_token,omitempty"`
}

// GoogleAuthResponse represents the response for Google authentication
type GoogleAuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// GoogleAuth handles Google OAuth authentication
func (h *AuthHandler) GoogleAuth(c *gin.Context) {
	var req GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var googleUser *GoogleTokenInfo
	var err error

	// Try ID token first, then access token
	if req.IDToken != "" {
		googleUser, err = h.verifyGoogleToken(req.IDToken)
		if err != nil {
			h.logger.Error("Failed to verify Google ID token: " + err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google ID token"})
			return
		}
	} else if req.AccessToken != "" {
		googleUser, err = h.verifyGoogleAccessToken(req.AccessToken)
		if err != nil {
			h.logger.Error("Failed to verify Google access token: " + err.Error())
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google access token"})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either id_token or access_token is required"})
		return
	}

	// Check if user exists or create new user
	var user models.User
	var isNewUser bool

	if h.userRepo != nil {
		// Try to find existing user by email
		existingUser, err := h.userRepo.GetByEmail(googleUser.Email)
		if err == nil {
			// User exists, update their info with Google data
			user = *existingUser
			user.FirstName = stringPtr(googleUser.GivenName)
			user.LastName = stringPtr(googleUser.FamilyName)
			user.DisplayName = stringPtr(googleUser.Name)
			user.AvatarURL = stringPtr(googleUser.Picture)
			user.IsVerified = googleUser.EmailVerified
			user.UpdatedAt = time.Now()

			// Update user in database
			err = h.userRepo.Update(&user)
			if err != nil {
				h.logger.Error("Failed to update user: " + err.Error())
			}
		} else {
			// User doesn't exist, create new user
			isNewUser = true
			user = models.User{
				ID:                fmt.Sprintf("google_%s", googleUser.ID),
				Username:          generateUsernameFromEmail(googleUser.Email),
				Email:             googleUser.Email,
				FirstName:         stringPtr(googleUser.GivenName),
				LastName:          stringPtr(googleUser.FamilyName),
				DisplayName:       stringPtr(googleUser.Name),
				AvatarURL:         stringPtr(googleUser.Picture),
				IsVerified:        googleUser.EmailVerified,
				IsCreator:         false,
				VerificationLevel: "email",
				AccountType:       "personal",
				CreatedAt:         time.Now(),
				UpdatedAt:         time.Now(),
			}

			// Create user in database
			err = h.userRepo.Create(&user)
			if err != nil {
				h.logger.Error("Failed to create user: " + err.Error())
				// Continue with dummy data if database fails
			}
		}
	} else {
		// No database connection, use dummy data
		user = models.User{
			ID:                fmt.Sprintf("google_%s", googleUser.ID),
			Username:          generateUsernameFromEmail(googleUser.Email),
			Email:             googleUser.Email,
			FirstName:         stringPtr(googleUser.GivenName),
			LastName:          stringPtr(googleUser.FamilyName),
			DisplayName:       stringPtr(googleUser.Name),
			AvatarURL:         stringPtr(googleUser.Picture),
			IsVerified:        googleUser.EmailVerified,
			IsCreator:         false,
			VerificationLevel: "email",
			AccountType:       "personal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		}
	}

	// Generate JWT token
	username := user.Username
	if username == "" {
		username = generateUsernameFromEmail(googleUser.Email)
	}
	
	token, err := h.jwtManager.Generate(user.ID, username, user.Email, "user", user.IsCreator)
	if err != nil {
		h.logger.Error("Failed to generate JWT token: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Create AuthResponse compatible with frontend
	authResponse := models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: "", // Add refresh token if needed
		ExpiresIn:    3600,
	}

	if isNewUser {
		h.logger.Info(fmt.Sprintf("New user created via Google OAuth: %s", user.Email))
	} else {
		h.logger.Info(fmt.Sprintf("User authenticated via Google OAuth: %s", user.Email))
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    authResponse,
		Message: "Google authentication successful",
		Success: true,
	})
}

// verifyGoogleToken verifies the Google ID token and returns user info
func (h *AuthHandler) verifyGoogleToken(idToken string) (*GoogleTokenInfo, error) {
	// Parse the JWT token without verification first to get the token info
	token, _, err := new(jwt.Parser).ParseUnverified(idToken, jwt.MapClaims{})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	_, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	// Verify token with Google's endpoint
	resp, err := http.Get(fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken))
	if err != nil {
		return nil, fmt.Errorf("failed to verify token with Google: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid token: Google returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read Google response: %w", err)
	}

	var tokenInfo GoogleTokenInfo
	if err := json.Unmarshal(body, &tokenInfo); err != nil {
		return nil, fmt.Errorf("failed to parse Google response: %w", err)
	}

	// Additional validation
	if tokenInfo.Email == "" {
		return nil, fmt.Errorf("no email in token")
	}

	return &tokenInfo, nil
}

// verifyGoogleAccessToken verifies the Google access token and returns user info
func (h *AuthHandler) verifyGoogleAccessToken(accessToken string) (*GoogleTokenInfo, error) {
	// Get user info from Google API using access token
	resp, err := http.Get(fmt.Sprintf("https://www.googleapis.com/oauth2/v2/userinfo?access_token=%s", accessToken))
	if err != nil {
		return nil, fmt.Errorf("failed to get user info from Google: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid access token: Google returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read Google response: %w", err)
	}

	var userInfo GoogleTokenInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse Google response: %w", err)
	}

	// Additional validation
	if userInfo.Email == "" {
		return nil, fmt.Errorf("no email in user info")
	}

	return &userInfo, nil
}

// GoogleCallbackRequest represents the request body for Google OAuth callback
type GoogleCallbackRequest struct {
	Code        string `json:"code" binding:"required"`
	RedirectURI string `json:"redirect_uri" binding:"required"`
}

// GoogleAuthCallback handles the OAuth callback from Google
func (h *AuthHandler) GoogleAuthCallback(c *gin.Context) {
	var req GoogleCallbackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Exchange authorization code for tokens
	tokenResponse, err := h.exchangeCodeForTokens(req.Code, req.RedirectURI)
	if err != nil {
		h.logger.Error("Failed to exchange code for tokens: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to get tokens from Google"})
		return
	}

	// Get user info using access token
	googleUser, err := h.verifyGoogleAccessToken(tokenResponse.AccessToken)
	if err != nil {
		h.logger.Error("Failed to get user info: " + err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to get user information"})
		return
	}

	// Check if user exists or create new user (same logic as GoogleAuth)
	var user models.User
	var isNewUser bool

	if h.userRepo != nil {
		// Try to find existing user by email
		existingUser, err := h.userRepo.GetByEmail(googleUser.Email)
		if err == nil {
			// User exists, update their info with Google data
			user = *existingUser
			user.FirstName = stringPtr(googleUser.GivenName)
			user.LastName = stringPtr(googleUser.FamilyName)
			user.DisplayName = stringPtr(googleUser.Name)
			user.AvatarURL = stringPtr(googleUser.Picture)
			user.IsVerified = googleUser.EmailVerified
			user.UpdatedAt = time.Now()

			// Update user in database
			err = h.userRepo.Update(&user)
			if err != nil {
				h.logger.Error("Failed to update user: " + err.Error())
			}
		} else {
			// User doesn't exist, create new user
			isNewUser = true
			user = models.User{
				ID:                fmt.Sprintf("google_%s", googleUser.ID),
				Username:          generateUsernameFromEmail(googleUser.Email),
				Email:             googleUser.Email,
				FirstName:         stringPtr(googleUser.GivenName),
				LastName:          stringPtr(googleUser.FamilyName),
				DisplayName:       stringPtr(googleUser.Name),
				AvatarURL:         stringPtr(googleUser.Picture),
				IsVerified:        googleUser.EmailVerified,
				IsCreator:         false,
				VerificationLevel: "email",
				AccountType:       "personal",
				CreatedAt:         time.Now(),
				UpdatedAt:         time.Now(),
			}

			// Create user in database
			err = h.userRepo.Create(&user)
			if err != nil {
				h.logger.Error("Failed to create user: " + err.Error())
				// Continue with dummy data if database fails
			}
		}
	} else {
		// No database connection, use dummy data
		user = models.User{
			ID:                fmt.Sprintf("google_%s", googleUser.ID),
			Username:          generateUsernameFromEmail(googleUser.Email),
			Email:             googleUser.Email,
			FirstName:         stringPtr(googleUser.GivenName),
			LastName:          stringPtr(googleUser.FamilyName),
			DisplayName:       stringPtr(googleUser.Name),
			AvatarURL:         stringPtr(googleUser.Picture),
			IsVerified:        googleUser.EmailVerified,
			IsCreator:         false,
			VerificationLevel: "email",
			AccountType:       "personal",
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		}
	}

	// Generate JWT token
	username := user.Username
	if username == "" {
		username = generateUsernameFromEmail(googleUser.Email)
	}
	
	token, err := h.jwtManager.Generate(user.ID, username, user.Email, "user", user.IsCreator)
	if err != nil {
		h.logger.Error("Failed to generate JWT token: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Create AuthResponse compatible with frontend
	authResponse := models.AuthResponse{
		User:         user,
		Token:        token,
		RefreshToken: "", // Add refresh token if needed
		ExpiresIn:    3600,
	}

	if isNewUser {
		h.logger.Info(fmt.Sprintf("New user created via Google OAuth: %s", user.Email))
	} else {
		h.logger.Info(fmt.Sprintf("User authenticated via Google OAuth: %s", user.Email))
	}

	c.JSON(http.StatusOK, models.ApiResponse{
		Data:    authResponse,
		Message: "Google authentication successful",
		Success: true,
	})
}

// TokenResponse represents Google's token response
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
	IDToken      string `json:"id_token"`
}

// exchangeCodeForTokens exchanges authorization code for access tokens
func (h *AuthHandler) exchangeCodeForTokens(code, redirectURI string) (*TokenResponse, error) {
	// This is a simplified implementation - in production you'd need proper OAuth2 client configuration
	tokenURL := "https://oauth2.googleapis.com/token"
	
	data := fmt.Sprintf(
		"code=%s&client_id=%s&client_secret=%s&redirect_uri=%s&grant_type=authorization_code",
		code,
		"896655436457-h6a1jiqilj6vclugv4il92a3khtadh1c.apps.googleusercontent.com", // This should come from config
		"", // Client secret would be needed for production
		redirectURI,
	)
	
	resp, err := http.Post(tokenURL, "application/x-www-form-urlencoded", strings.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var tokenResp TokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode token response: %w", err)
	}
	
	return &tokenResp, nil
}

// generateUsernameFromEmail creates a username from email address
func generateUsernameFromEmail(email string) string {
	// Simple implementation: take the part before @
	for i, char := range email {
		if char == '@' {
			return email[:i]
		}
	}
	return email
}

