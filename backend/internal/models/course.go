package models

import (
	"encoding/json"
	"time"
)

type Course struct {
	ID              string          `json:"id" db:"id"`
	InstructorID    string          `json:"instructorId" db:"instructor_id"`
	CategoryID      *string         `json:"categoryId,omitempty" db:"category_id"`
	Title           string          `json:"title" db:"title"`
	Subtitle        *string         `json:"subtitle,omitempty" db:"subtitle"`
	Description     *string         `json:"description,omitempty" db:"description"`
	ThumbnailURL    *string         `json:"thumbnailUrl,omitempty" db:"thumbnail_url"`
	PreviewVideoURL *string         `json:"previewVideoUrl,omitempty" db:"preview_video_url"`
	Price           float64         `json:"price" db:"price"`
	IsFree          bool            `json:"isFree" db:"is_free"`
	Level           string          `json:"level" db:"level"`
	DurationHours   *int            `json:"durationHours,omitempty" db:"duration_hours"`
	Language        string          `json:"language" db:"language"`
	Requirements    *string         `json:"requirements,omitempty" db:"requirements"`
	WhatYouLearn    json.RawMessage `json:"whatYouLearn,omitempty" db:"what_you_learn"`
	Status          string          `json:"status" db:"status"`
	EnrollmentCount int             `json:"enrollmentCount" db:"enrollment_count"`
	RatingAverage   float64         `json:"ratingAverage" db:"rating_average"`
	RatingCount     int             `json:"ratingCount" db:"rating_count"`
	CreatedAt       time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time       `json:"updatedAt" db:"updated_at"`

	// Joined fields
	Instructor   *User     `json:"instructor,omitempty"`
	Category     *Category `json:"category,omitempty"`
	Lessons      []Lesson  `json:"lessons,omitempty"`
	IsEnrolled   bool      `json:"isEnrolled,omitempty"`
	Progress     int       `json:"progress,omitempty"` // percentage
	IsPurchased  bool      `json:"isPurchased,omitempty"`
	IsInWishlist bool      `json:"isInWishlist,omitempty"`
}

type Lesson struct {
	ID              string          `json:"id" db:"id"`
	CourseID        string          `json:"courseId" db:"course_id"`
	Title           string          `json:"title" db:"title"`
	Description     *string         `json:"description,omitempty" db:"description"`
	Content         *string         `json:"content,omitempty" db:"content"`
	VideoURL        *string         `json:"videoUrl,omitempty" db:"video_url"`
	DurationMinutes *int            `json:"durationMinutes,omitempty" db:"duration_minutes"`
	SortOrder       int             `json:"sortOrder" db:"sort_order"`
	IsPreview       bool            `json:"isPreview" db:"is_preview"`
	Resources       json.RawMessage `json:"resources,omitempty" db:"resources"`
	CreatedAt       time.Time       `json:"createdAt" db:"created_at"`

	// Additional fields
	IsCompleted bool `json:"isCompleted,omitempty"`
	IsAccessible bool `json:"isAccessible,omitempty"`
}

type LessonResource struct {
	Name        string `json:"name"`
	URL         string `json:"url"`
	Type        string `json:"type"` // pdf, zip, link, video
	Size        int64  `json:"size,omitempty"`
	Description string `json:"description,omitempty"`
}

type CreateCourseRequest struct {
	CategoryID      *string  `json:"categoryId,omitempty"`
	Title           string   `json:"title" validate:"required,min=3,max=255"`
	Subtitle        *string  `json:"subtitle,omitempty" validate:"omitempty,max=500"`
	Description     *string  `json:"description,omitempty" validate:"omitempty,max=5000"`
	ThumbnailURL    *string  `json:"thumbnailUrl,omitempty" validate:"omitempty,url"`
	PreviewVideoURL *string  `json:"previewVideoUrl,omitempty" validate:"omitempty,url"`
	Price           float64  `json:"price" validate:"min=0"`
	IsFree          bool     `json:"isFree"`
	Level           string   `json:"level" validate:"oneof=beginner intermediate advanced"`
	DurationHours   *int     `json:"durationHours,omitempty" validate:"omitempty,min=1"`
	Language        string   `json:"language" validate:"required,len=2"`
	Requirements    *string  `json:"requirements,omitempty"`
	WhatYouLearn    []string `json:"whatYouLearn,omitempty"`
}

type UpdateCourseRequest struct {
	CategoryID      *string  `json:"categoryId,omitempty"`
	Title           *string  `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Subtitle        *string  `json:"subtitle,omitempty" validate:"omitempty,max=500"`
	Description     *string  `json:"description,omitempty" validate:"omitempty,max=5000"`
	ThumbnailURL    *string  `json:"thumbnailUrl,omitempty" validate:"omitempty,url"`
	PreviewVideoURL *string  `json:"previewVideoUrl,omitempty" validate:"omitempty,url"`
	Price           *float64 `json:"price,omitempty" validate:"omitempty,min=0"`
	IsFree          *bool    `json:"isFree,omitempty"`
	Level           *string  `json:"level,omitempty" validate:"omitempty,oneof=beginner intermediate advanced"`
	DurationHours   *int     `json:"durationHours,omitempty" validate:"omitempty,min=1"`
	Language        *string  `json:"language,omitempty" validate:"omitempty,len=2"`
	Requirements    *string  `json:"requirements,omitempty"`
	WhatYouLearn    []string `json:"whatYouLearn,omitempty"`
	Status          *string  `json:"status,omitempty" validate:"omitempty,oneof=draft published archived"`
}

type CreateLessonRequest struct {
	Title           string            `json:"title" validate:"required,min=3,max=255"`
	Description     *string           `json:"description,omitempty" validate:"omitempty,max=1000"`
	Content         *string           `json:"content,omitempty"`
	VideoURL        *string           `json:"videoUrl,omitempty" validate:"omitempty,url"`
	DurationMinutes *int              `json:"durationMinutes,omitempty" validate:"omitempty,min=1"`
	SortOrder       int               `json:"sortOrder" validate:"min=0"`
	IsPreview       bool              `json:"isPreview"`
	Resources       []LessonResource  `json:"resources,omitempty"`
}

type UpdateLessonRequest struct {
	Title           *string           `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Description     *string           `json:"description,omitempty" validate:"omitempty,max=1000"`
	Content         *string           `json:"content,omitempty"`
	VideoURL        *string           `json:"videoUrl,omitempty" validate:"omitempty,url"`
	DurationMinutes *int              `json:"durationMinutes,omitempty" validate:"omitempty,min=1"`
	SortOrder       *int              `json:"sortOrder,omitempty" validate:"omitempty,min=0"`
	IsPreview       *bool             `json:"isPreview,omitempty"`
	Resources       []LessonResource  `json:"resources,omitempty"`
}

type CourseFilter struct {
	InstructorID *string   `json:"instructorId,omitempty"`
	CategoryID   *string   `json:"categoryId,omitempty"`
	Status       *string   `json:"status,omitempty"`
	IsFree       *bool     `json:"isFree,omitempty"`
	Level        *string   `json:"level,omitempty"`
	Language     *string   `json:"language,omitempty"`
	MinPrice     *float64  `json:"minPrice,omitempty"`
	MaxPrice     *float64  `json:"maxPrice,omitempty"`
	Search       *string   `json:"search,omitempty"`
	Limit        int       `json:"limit"`
	Offset       int       `json:"offset"`
	SortBy       string    `json:"sortBy"` // created_at, price, rating_average, enrollment_count
	SortOrder    string    `json:"sortOrder"` // asc, desc
}

type Enrollment struct {
	ID                   string     `json:"id" db:"id"`
	UserID               string     `json:"userId" db:"user_id"`
	CourseID             string     `json:"courseId" db:"course_id"`
	EnrollmentDate       time.Time  `json:"enrollmentDate" db:"enrollment_date"`
	CompletionDate       *time.Time `json:"completionDate,omitempty" db:"completion_date"`
	ProgressPercentage   int        `json:"progressPercentage" db:"progress_percentage"`
	LastAccessedLessonID *string    `json:"lastAccessedLessonId,omitempty" db:"last_accessed_lesson_id"`
	CertificateURL       *string    `json:"certificateUrl,omitempty" db:"certificate_url"`

	// Joined fields
	Course *Course `json:"course,omitempty"`
	User   *User   `json:"user,omitempty"`
}