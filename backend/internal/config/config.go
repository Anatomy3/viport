package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	RedisURL    string
	JWTSecret   string
	LogLevel    string
}

func Load() *Config {
	// Load .env file if it exists
	godotenv.Load()

	return &Config{
		Port:        getEnv("PORT", "8080"),
		Environment: getEnv("ENVIRONMENT", "development"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://viport_user:viport_password@localhost:5432/viport_dev?sslmode=disable"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
		LogLevel:    getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}