package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	requests map[string][]time.Time
	limit    int
	window   time.Duration
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
}

func (rl *RateLimiter) Allow(key string) bool {
	now := time.Now()
	
	// Clean old requests
	if timestamps, exists := rl.requests[key]; exists {
		var validTimestamps []time.Time
		for _, timestamp := range timestamps {
			if now.Sub(timestamp) < rl.window {
				validTimestamps = append(validTimestamps, timestamp)
			}
		}
		rl.requests[key] = validTimestamps
	}

	// Check if limit exceeded
	if len(rl.requests[key]) >= rl.limit {
		return false
	}

	// Add current request
	rl.requests[key] = append(rl.requests[key], now)
	return true
}

func RateLimitMiddleware(limit int, window time.Duration) gin.HandlerFunc {
	limiter := NewRateLimiter(limit, window)

	return func(c *gin.Context) {
		// Use user ID if authenticated, otherwise use IP
		key := c.ClientIP()
		if userID, exists := c.Get("userID"); exists {
			key = fmt.Sprintf("user:%s", userID.(string))
		}

		if !limiter.Allow(key) {
			c.Header("X-RateLimit-Limit", strconv.Itoa(limit))
			c.Header("X-RateLimit-Window", window.String())
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded",
				"message": fmt.Sprintf("Too many requests. Limit: %d per %s", limit, window),
				"success": false,
			})
			c.Abort()
			return
		}

		c.Header("X-RateLimit-Limit", strconv.Itoa(limit))
		c.Header("X-RateLimit-Window", window.String())
		c.Next()
	}
}