package models

import (
	"encoding/json"
	"time"
)

type Portfolio struct {
	ID             string          `json:"id" db:"id"`
	UserID         string          `json:"userId" db:"user_id"`
	Title          string          `json:"title" db:"title"`
	Slug           string          `json:"slug" db:"slug"`
	Description    *string         `json:"description,omitempty" db:"description"`
	TemplateID     *string         `json:"templateId,omitempty" db:"template_id"`
	ThemeConfig    json.RawMessage `json:"themeConfig,omitempty" db:"theme_config"`
	Sections       json.RawMessage `json:"sections,omitempty" db:"sections"`
	CustomDomain   *string         `json:"customDomain,omitempty" db:"custom_domain"`
	IsPublished    bool            `json:"isPublished" db:"is_published"`
	SEOConfig      json.RawMessage `json:"seoConfig,omitempty" db:"seo_config"`
	AnalyticsConfig json.RawMessage `json:"analyticsConfig,omitempty" db:"analytics_config"`
	CreatedAt      time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time       `json:"updatedAt" db:"updated_at"`

	// Joined fields
	User     *User              `json:"user,omitempty"`
	Projects []PortfolioProject `json:"projects,omitempty"`
	ViewCount int               `json:"viewCount,omitempty"`
}

type PortfolioProject struct {
	ID             string          `json:"id" db:"id"`
	PortfolioID    string          `json:"portfolioId" db:"portfolio_id"`
	Title          string          `json:"title" db:"title"`
	Description    *string         `json:"description,omitempty" db:"description"`
	ImageURLs      json.RawMessage `json:"imageUrls,omitempty" db:"image_urls"`
	ProjectURL     *string         `json:"projectUrl,omitempty" db:"project_url"`
	Technologies   json.RawMessage `json:"technologies,omitempty" db:"technologies"`
	CompletionDate *time.Time      `json:"completionDate,omitempty" db:"completion_date"`
	SortOrder      int             `json:"sortOrder" db:"sort_order"`
	CreatedAt      time.Time       `json:"createdAt" db:"created_at"`
}

type PortfolioSection struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"` // hero, about, projects, skills, experience, contact, custom
	Title       string                 `json:"title"`
	Visible     bool                   `json:"visible"`
	SortOrder   int                    `json:"sortOrder"`
	Settings    map[string]interface{} `json:"settings"`
	Content     map[string]interface{} `json:"content"`
}

type ThemeConfig struct {
	ColorScheme   string                 `json:"colorScheme"` // light, dark, auto
	PrimaryColor  string                 `json:"primaryColor"`
	SecondaryColor string                `json:"secondaryColor"`
	FontFamily    string                 `json:"fontFamily"`
	FontSize      string                 `json:"fontSize"`
	Layout        string                 `json:"layout"` // modern, classic, minimal
	Animations    bool                   `json:"animations"`
	CustomCSS     string                 `json:"customCSS"`
	Settings      map[string]interface{} `json:"settings"`
}

type SEOConfig struct {
	Title       string            `json:"title"`
	Description string            `json:"description"`
	Keywords    []string          `json:"keywords"`
	OGImage     string            `json:"ogImage"`
	MetaTags    map[string]string `json:"metaTags"`
}

type CreatePortfolioRequest struct {
	Title        string             `json:"title" validate:"required,min=3,max=255"`
	Slug         string             `json:"slug" validate:"required,min=3,max=100,alphanum"`
	Description  *string            `json:"description,omitempty" validate:"omitempty,max=1000"`
	TemplateID   *string            `json:"templateId,omitempty"`
	ThemeConfig  *ThemeConfig       `json:"themeConfig,omitempty"`
	Sections     []PortfolioSection `json:"sections,omitempty"`
	CustomDomain *string            `json:"customDomain,omitempty" validate:"omitempty,fqdn"`
	SEOConfig    *SEOConfig         `json:"seoConfig,omitempty"`
}

type UpdatePortfolioRequest struct {
	Title        *string            `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Slug         *string            `json:"slug,omitempty" validate:"omitempty,min=3,max=100,alphanum"`
	Description  *string            `json:"description,omitempty" validate:"omitempty,max=1000"`
	TemplateID   *string            `json:"templateId,omitempty"`
	ThemeConfig  *ThemeConfig       `json:"themeConfig,omitempty"`
	Sections     []PortfolioSection `json:"sections,omitempty"`
	CustomDomain *string            `json:"customDomain,omitempty" validate:"omitempty,fqdn"`
	IsPublished  *bool              `json:"isPublished,omitempty"`
	SEOConfig    *SEOConfig         `json:"seoConfig,omitempty"`
}

type CreateProjectRequest struct {
	Title          string     `json:"title" validate:"required,min=3,max=255"`
	Description    *string    `json:"description,omitempty" validate:"omitempty,max=2000"`
	ImageURLs      []string   `json:"imageUrls,omitempty"`
	ProjectURL     *string    `json:"projectUrl,omitempty" validate:"omitempty,url"`
	Technologies   []string   `json:"technologies,omitempty"`
	CompletionDate *time.Time `json:"completionDate,omitempty"`
	SortOrder      int        `json:"sortOrder" validate:"min=0"`
}

type UpdateProjectRequest struct {
	Title          *string    `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Description    *string    `json:"description,omitempty" validate:"omitempty,max=2000"`
	ImageURLs      []string   `json:"imageUrls,omitempty"`
	ProjectURL     *string    `json:"projectUrl,omitempty" validate:"omitempty,url"`
	Technologies   []string   `json:"technologies,omitempty"`
	CompletionDate *time.Time `json:"completionDate,omitempty"`
	SortOrder      *int       `json:"sortOrder,omitempty" validate:"omitempty,min=0"`
}

type PortfolioFilter struct {
	UserID      *string `json:"userId,omitempty"`
	IsPublished *bool   `json:"isPublished,omitempty"`
	TemplateID  *string `json:"templateId,omitempty"`
	Search      *string `json:"search,omitempty"`
	Limit       int     `json:"limit"`
	Offset      int     `json:"offset"`
	SortBy      string  `json:"sortBy"` // created_at, updated_at, title
	SortOrder   string  `json:"sortOrder"` // asc, desc
}

type PortfolioTemplate struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	Category    string                 `json:"category"`
	PreviewURL  string                 `json:"previewUrl"`
	ThumbnailURL string                `json:"thumbnailUrl"`
	IsPremium   bool                   `json:"isPremium"`
	Price       float64                `json:"price"`
	Features    []string               `json:"features"`
	Sections    []PortfolioSection     `json:"sections"`
	ThemeConfig ThemeConfig            `json:"themeConfig"`
	Settings    map[string]interface{} `json:"settings"`
}