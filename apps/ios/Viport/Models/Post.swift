import Foundation

// MARK: - Post Model

struct Post: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    let user: User
    let content: String?
    let mediaItems: [MediaItem]
    let tags: [String]
    let location: Location?
    let isLiked: Bool
    let isSaved: Bool
    let likesCount: Int
    let commentsCount: Int
    let sharesCount: Int
    let viewsCount: Int
    let createdAt: Date
    let updatedAt: Date
    
    // Post type
    let postType: PostType
    
    // Engagement metrics
    let engagementRate: Double?
    
    // Visibility settings
    let visibility: PostVisibility
    
    enum CodingKeys: String, CodingKey {
        case id, content, tags, location
        case userId = "user_id"
        case user
        case mediaItems = "media_items"
        case isLiked = "is_liked"
        case isSaved = "is_saved"
        case likesCount = "likes_count"
        case commentsCount = "comments_count"
        case sharesCount = "shares_count"
        case viewsCount = "views_count"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case postType = "post_type"
        case engagementRate = "engagement_rate"
        case visibility
    }
}

// MARK: - Post Type

enum PostType: String, Codable, CaseIterable {
    case text = "text"
    case image = "image"
    case video = "video"
    case carousel = "carousel"
    case story = "story"
    case repost = "repost"
    case poll = "poll"
    
    var displayName: String {
        switch self {
        case .text: return "Text Post"
        case .image: return "Photo"
        case .video: return "Video"
        case .carousel: return "Carousel"
        case .story: return "Story"
        case .repost: return "Repost"
        case .poll: return "Poll"
        }
    }
    
    var iconName: String {
        switch self {
        case .text: return "text.alignleft"
        case .image: return "photo"
        case .video: return "video"
        case .carousel: return "rectangle.stack"
        case .story: return "circle"
        case .repost: return "arrow.2.squarepath"
        case .poll: return "chart.bar"
        }
    }
}

// MARK: - Post Visibility

enum PostVisibility: String, Codable, CaseIterable {
    case public = "public"
    case followers = "followers"
    case private = "private"
    case draft = "draft"
    
    var displayName: String {
        switch self {
        case .public: return "Public"
        case .followers: return "Followers Only"
        case .private: return "Private"
        case .draft: return "Draft"
        }
    }
    
    var iconName: String {
        switch self {
        case .public: return "globe"
        case .followers: return "person.2"
        case .private: return "lock"
        case .draft: return "doc.text"
        }
    }
}

// MARK: - Media Item

struct MediaItem: Codable, Identifiable, Hashable {
    let id: String
    let url: String
    let thumbnailURL: String?
    let type: MediaType
    let width: Int?
    let height: Int?
    let duration: Int? // in seconds for videos
    let size: Int? // file size in bytes
    let altText: String?
    let order: Int
    
    enum CodingKeys: String, CodingKey {
        case id, url, type, width, height, duration, size, order
        case thumbnailURL = "thumbnail_url"
        case altText = "alt_text"
    }
}

enum MediaType: String, Codable, CaseIterable {
    case image = "image"
    case video = "video"
    case gif = "gif"
    case audio = "audio"
    
    var displayName: String {
        switch self {
        case .image: return "Image"
        case .video: return "Video"
        case .gif: return "GIF"
        case .audio: return "Audio"
        }
    }
}

// MARK: - Location

struct Location: Codable, Hashable {
    let id: String
    let name: String
    let address: String?
    let latitude: Double
    let longitude: Double
    let city: String?
    let country: String?
    
    enum CodingKeys: String, CodingKey {
        case id, name, address, latitude, longitude, city, country
    }
}

// MARK: - Comment Model

struct Comment: Codable, Identifiable, Hashable {
    let id: String
    let postId: String
    let userId: String
    let user: User
    let content: String
    let parentCommentId: String?
    let isLiked: Bool
    let likesCount: Int
    let repliesCount: Int
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, content
        case postId = "post_id"
        case userId = "user_id"
        case user
        case parentCommentId = "parent_comment_id"
        case isLiked = "is_liked"
        case likesCount = "likes_count"
        case repliesCount = "replies_count"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MARK: - Like Model

struct Like: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    let user: User
    let postId: String?
    let commentId: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case user
        case postId = "post_id"
        case commentId = "comment_id"
        case createdAt = "created_at"
    }
}

// MARK: - Post Creation Models

struct CreatePostRequest: Codable {
    let content: String?
    let mediaItems: [String]? // Array of media IDs
    let tags: [String]
    let location: Location?
    let postType: PostType
    let visibility: PostVisibility
    
    enum CodingKeys: String, CodingKey {
        case content, tags, location, visibility
        case mediaItems = "media_items"
        case postType = "post_type"
    }
}

struct UpdatePostRequest: Codable {
    let content: String?
    let tags: [String]
    let location: Location?
    let visibility: PostVisibility
    
    enum CodingKeys: String, CodingKey {
        case content, tags, location, visibility
    }
}

struct CreateCommentRequest: Codable {
    let content: String
    let parentCommentId: String?
    
    enum CodingKeys: String, CodingKey {
        case content
        case parentCommentId = "parent_comment_id"
    }
}

// MARK: - Post Response Models

struct PostsResponse: Codable {
    let posts: [Post]
    let pagination: PaginationInfo
    let hasMore: Bool
    
    enum CodingKeys: String, CodingKey {
        case posts, pagination
        case hasMore = "has_more"
    }
}

struct CommentsResponse: Codable {
    let comments: [Comment]
    let pagination: PaginationInfo
    let hasMore: Bool
    
    enum CodingKeys: String, CodingKey {
        case comments, pagination
        case hasMore = "has_more"
    }
}

struct PaginationInfo: Codable {
    let currentPage: Int
    let totalPages: Int
    let totalItems: Int
    let itemsPerPage: Int
    
    enum CodingKeys: String, CodingKey {
        case currentPage = "current_page"
        case totalPages = "total_pages"
        case totalItems = "total_items"
        case itemsPerPage = "items_per_page"
    }
}

// MARK: - Engagement Models

struct LikeResponse: Codable {
    let isLiked: Bool
    let likesCount: Int
    
    enum CodingKeys: String, CodingKey {
        case isLiked = "is_liked"
        case likesCount = "likes_count"
    }
}

struct SaveResponse: Codable {
    let isSaved: Bool
    let savedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case isSaved = "is_saved"
        case savedAt = "saved_at"
    }
}

// MARK: - Post Extensions

extension Post {
    var hasMedia: Bool {
        return !mediaItems.isEmpty
    }
    
    var firstMediaItem: MediaItem? {
        return mediaItems.first
    }
    
    var isVideo: Bool {
        return mediaItems.contains { $0.type == .video }
    }
    
    var isCarousel: Bool {
        return mediaItems.count > 1
    }
    
    var formattedCreatedAt: String {
        return formatTimeAgo(from: createdAt)
    }
    
    var aspectRatio: Double {
        guard let firstMedia = firstMediaItem,
              let width = firstMedia.width,
              let height = firstMedia.height,
              height > 0 else {
            return 1.0 // Default square aspect ratio
        }
        return Double(width) / Double(height)
    }
    
    func formattedCount(_ count: Int) -> String {
        switch count {
        case 0..<1000:
            return "\(count)"
        case 1000..<1_000_000:
            let thousands = Double(count) / 1000.0
            return String(format: "%.1fK", thousands)
        case 1_000_000...:
            let millions = Double(count) / 1_000_000.0
            return String(format: "%.1fM", millions)
        default:
            return "\(count)"
        }
    }
    
    var formattedLikesCount: String {
        return formattedCount(likesCount)
    }
    
    var formattedCommentsCount: String {
        return formattedCount(commentsCount)
    }
    
    var formattedSharesCount: String {
        return formattedCount(sharesCount)
    }
    
    var formattedViewsCount: String {
        return formattedCount(viewsCount)
    }
}

extension MediaItem {
    var aspectRatio: Double {
        guard let width = width,
              let height = height,
              height > 0 else {
            return 1.0
        }
        return Double(width) / Double(height)
    }
    
    var formattedDuration: String? {
        guard let duration = duration else { return nil }
        
        let minutes = duration / 60
        let seconds = duration % 60
        
        if minutes > 0 {
            return String(format: "%d:%02d", minutes, seconds)
        } else {
            return String(format: "0:%02d", seconds)
        }
    }
    
    var formattedFileSize: String? {
        guard let size = size else { return nil }
        
        let formatter = ByteCountFormatter()
        formatter.countStyle = .file
        return formatter.string(fromByteCount: Int64(size))
    }
}

// MARK: - Helper Functions

private func formatTimeAgo(from date: Date) -> String {
    let now = Date()
    let timeInterval = now.timeIntervalSince(date)
    
    let minute: TimeInterval = 60
    let hour: TimeInterval = 60 * minute
    let day: TimeInterval = 24 * hour
    let week: TimeInterval = 7 * day
    let month: TimeInterval = 30 * day
    let year: TimeInterval = 365 * day
    
    switch timeInterval {
    case 0..<minute:
        return "now"
    case minute..<hour:
        let minutes = Int(timeInterval / minute)
        return "\(minutes)m"
    case hour..<day:
        let hours = Int(timeInterval / hour)
        return "\(hours)h"
    case day..<week:
        let days = Int(timeInterval / day)
        return "\(days)d"
    case week..<month:
        let weeks = Int(timeInterval / week)
        return "\(weeks)w"
    case month..<year:
        let months = Int(timeInterval / month)
        return "\(months)mo"
    default:
        let years = Int(timeInterval / year)
        return "\(years)y"
    }
}

// MARK: - Feed Models

struct FeedItem: Identifiable, Hashable {
    let id: String
    let type: FeedItemType
    let post: Post?
    let story: Story?
    let advertisement: Advertisement?
    
    enum FeedItemType: String, Codable {
        case post = "post"
        case story = "story"
        case advertisement = "advertisement"
        case suggested = "suggested"
    }
}

struct Story: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    let user: User
    let mediaItem: MediaItem
    let isViewed: Bool
    let viewsCount: Int
    let expiresAt: Date
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case user
        case mediaItem = "media_item"
        case isViewed = "is_viewed"
        case viewsCount = "views_count"
        case expiresAt = "expires_at"
        case createdAt = "created_at"
    }
}

struct Advertisement: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let imageURL: String
    let actionURL: String
    let actionText: String
    let sponsor: String
    
    enum CodingKeys: String, CodingKey {
        case id, title, description, sponsor
        case imageURL = "image_url"
        case actionURL = "action_url"
        case actionText = "action_text"
    }
}