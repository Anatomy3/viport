package models

import (
	"encoding/json"
	"time"
)

type Post struct {
	ID           string          `json:"id" db:"id"`
	UserID       string          `json:"userId" db:"user_id"`
	Title        *string         `json:"title,omitempty" db:"title"`
	Content      *string         `json:"content,omitempty" db:"content"`
	MediaURLs    json.RawMessage `json:"mediaUrls,omitempty" db:"media_urls"`
	MediaType    string          `json:"mediaType" db:"media_type"`
	Visibility   string          `json:"visibility" db:"visibility"`
	IsFeatured   bool            `json:"isFeatured" db:"is_featured"`
	LikeCount    int             `json:"likeCount" db:"like_count"`
	CommentCount int             `json:"commentCount" db:"comment_count"`
	ShareCount   int             `json:"shareCount" db:"share_count"`
	ViewCount    int             `json:"viewCount" db:"view_count"`
	CreatedAt    time.Time       `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time       `json:"updatedAt" db:"updated_at"`

	// Joined fields
	User      *User        `json:"user,omitempty"`
	Tags      []Tag        `json:"tags,omitempty"`
	IsLiked   bool         `json:"isLiked,omitempty"`
	IsSaved   bool         `json:"isSaved,omitempty"`
}

type MediaFile struct {
	URL       string `json:"url"`
	Type      string `json:"type"` // image, video
	Thumbnail string `json:"thumbnail,omitempty"`
	Width     int    `json:"width,omitempty"`
	Height    int    `json:"height,omitempty"`
	Duration  int    `json:"duration,omitempty"` // for videos in seconds
	Size      int64  `json:"size,omitempty"`
}

type CreatePostRequest struct {
	Title      *string     `json:"title,omitempty" validate:"omitempty,max=255"`
	Content    *string     `json:"content,omitempty" validate:"omitempty,max=5000"`
	MediaURLs  []MediaFile `json:"mediaUrls,omitempty"`
	MediaType  string      `json:"mediaType" validate:"oneof=image video mixed text"`
	Visibility string      `json:"visibility" validate:"oneof=public followers private"`
	TagNames   []string    `json:"tagNames,omitempty"`
}

type UpdatePostRequest struct {
	Title      *string     `json:"title,omitempty" validate:"omitempty,max=255"`
	Content    *string     `json:"content,omitempty" validate:"omitempty,max=5000"`
	MediaURLs  []MediaFile `json:"mediaUrls,omitempty"`
	Visibility *string     `json:"visibility,omitempty" validate:"omitempty,oneof=public followers private"`
	TagNames   []string    `json:"tagNames,omitempty"`
}

type PostFilter struct {
	UserID     *string `json:"userId,omitempty"`
	MediaType  *string `json:"mediaType,omitempty"`
	Visibility *string `json:"visibility,omitempty"`
	IsFeatured *bool   `json:"isFeatured,omitempty"`
	TagIDs     []string `json:"tagIds,omitempty"`
	Search     *string `json:"search,omitempty"`
	Limit      int     `json:"limit"`
	Offset     int     `json:"offset"`
	SortBy     string  `json:"sortBy"` // created_at, like_count, view_count
	SortOrder  string  `json:"sortOrder"` // asc, desc
}