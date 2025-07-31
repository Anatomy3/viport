package models

import (
	"encoding/json"
	"time"
)

type User struct {
	ID                string          `json:"id" db:"id"`
	Username          string          `json:"username" db:"username" validate:"required,min=3,max=50"`
	Email             string          `json:"email" db:"email" validate:"required,email"`
	PasswordHash      string          `json:"-" db:"password_hash"`
	FirstName         *string         `json:"firstName,omitempty" db:"first_name"`
	LastName          *string         `json:"lastName,omitempty" db:"last_name"`
	DisplayName       *string         `json:"displayName,omitempty" db:"display_name"`
	Bio               *string         `json:"bio,omitempty" db:"bio"`
	AvatarURL         *string         `json:"avatarUrl,omitempty" db:"avatar_url"`
	CoverImageURL     *string         `json:"coverImageUrl,omitempty" db:"cover_image_url"`
	Location          *string         `json:"location,omitempty" db:"location"`
	WebsiteURL        *string         `json:"websiteUrl,omitempty" db:"website_url"`
	SocialLinks       json.RawMessage `json:"socialLinks,omitempty" db:"social_links"`
	IsVerified        bool            `json:"isVerified" db:"is_verified"`
	IsCreator         bool            `json:"isCreator" db:"is_creator"`
	VerificationLevel string          `json:"verificationLevel" db:"verification_level"`
	AccountType       string          `json:"accountType" db:"account_type"`
	Preferences       json.RawMessage `json:"preferences,omitempty" db:"preferences"`
	CreatedAt         time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time       `json:"updatedAt" db:"updated_at"`
	LastActiveAt      *time.Time      `json:"lastActiveAt,omitempty" db:"last_active_at"`

	// Additional fields for API responses
	FollowerCount  int  `json:"followerCount,omitempty"`
	FollowingCount int  `json:"followingCount,omitempty"`
	PostCount      int  `json:"postCount,omitempty"`
	ProductCount   int  `json:"productCount,omitempty"`
	IsFollowing    bool `json:"isFollowing,omitempty"`
}

type SocialLinks struct {
	Instagram string `json:"instagram,omitempty"`
	Twitter   string `json:"twitter,omitempty"`
	LinkedIn  string `json:"linkedin,omitempty"`
	YouTube   string `json:"youtube,omitempty"`
	TikTok    string `json:"tiktok,omitempty"`
	GitHub    string `json:"github,omitempty"`
	Behance   string `json:"behance,omitempty"`
	Dribbble  string `json:"dribbble,omitempty"`
}

type UserPreferences struct {
	Theme               string   `json:"theme"`
	Language            string   `json:"language"`
	EmailNotifications  bool     `json:"emailNotifications"`
	PushNotifications   bool     `json:"pushNotifications"`
	PrivacyLevel        string   `json:"privacyLevel"`
	ShowOnlineStatus    bool     `json:"showOnlineStatus"`
	AllowMessages       string   `json:"allowMessages"` // everyone, followers, none
	ContentPreferences  []string `json:"contentPreferences"`
	MarketingEmails     bool     `json:"marketingEmails"`
}

type RegisterRequest struct {
	Username        string `json:"username" validate:"required,min=3,max=50"`
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" validate:"required,eqfield=Password"`
	FirstName       string `json:"firstName" validate:"required,min=2,max=100"`
	LastName        string `json:"lastName" validate:"required,min=2,max=100"`
	AccountType     string `json:"accountType" validate:"oneof=personal business creator"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UpdateProfileRequest struct {
	FirstName     *string          `json:"firstName,omitempty" validate:"omitempty,min=2,max=100"`
	LastName      *string          `json:"lastName,omitempty" validate:"omitempty,min=2,max=100"`
	DisplayName   *string          `json:"displayName,omitempty" validate:"omitempty,min=2,max=100"`
	Bio           *string          `json:"bio,omitempty" validate:"omitempty,max=1000"`
	Location      *string          `json:"location,omitempty" validate:"omitempty,max=255"`
	WebsiteURL    *string          `json:"websiteUrl,omitempty" validate:"omitempty,url"`
	SocialLinks   *SocialLinks     `json:"socialLinks,omitempty"`
	Preferences   *UserPreferences `json:"preferences,omitempty"`
}

type AuthResponse struct {
	User         User   `json:"user"`
	Token        string `json:"token"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    int64  `json:"expiresIn"`
}

type UserStatsResponse struct {
	TotalEarnings    float64 `json:"totalEarnings"`
	MonthlyEarnings  float64 `json:"monthlyEarnings"`
	TotalSales       int     `json:"totalSales"`
	ProductViews     int     `json:"productViews"`
	ProfileViews     int     `json:"profileViews"`
	FollowerGrowth   int     `json:"followerGrowth"`
	PopularProducts  []any   `json:"popularProducts"`
	RecentActivity   []any   `json:"recentActivity"`
}