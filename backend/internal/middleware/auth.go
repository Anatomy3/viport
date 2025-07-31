package middleware

import (
	"net/http"
	"strings"
	"viport-backend/pkg/auth"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authorization header required",
				"success": false,
			})
			c.Abort()
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid authorization header format",
				"success": false,
			})
			c.Abort()
			return
		}

		claims, err := jwtManager.Verify(bearerToken[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid or expired token",
				"success": false,
			})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Set("isCreator", claims.IsCreator)
		c.Set("claims", claims)

		c.Next()
	}
}

func OptionalAuthMiddleware(jwtManager *auth.JWTManager) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		bearerToken := strings.Split(authHeader, " ")
		if len(bearerToken) != 2 || bearerToken[0] != "Bearer" {
			c.Next()
			return
		}

		claims, err := jwtManager.Verify(bearerToken[1])
		if err != nil {
			c.Next()
			return
		}

		// Set user info in context
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Set("isCreator", claims.IsCreator)
		c.Set("claims", claims)

		c.Next()
	}
}

func CreatorOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isCreator, exists := c.Get("isCreator")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"success": false,
			})
			c.Abort()
			return
		}

		if !isCreator.(bool) {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Creator access required",
				"success": false,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

func AdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"success": false,
			})
			c.Abort()
			return
		}

		if role.(string) != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Admin access required",
				"success": false,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}