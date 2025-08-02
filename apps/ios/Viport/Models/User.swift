import Foundation

// MARK: - User Model

struct User: Codable, Identifiable, Hashable {
    let id: String
    let email: String
    let username: String
    let displayName: String
    let firstName: String?
    let lastName: String?
    let avatarURL: String?
    let bio: String?
    let website: String?
    let location: String?
    let isVerified: Bool
    let isPrivate: Bool
    let followersCount: Int
    let followingCount: Int
    let postsCount: Int
    let createdAt: Date
    let updatedAt: Date
    
    // Social media links
    let socialMediaLinks: SocialMediaLinks?
    
    // Account settings
    let notificationSettings: NotificationSettings?
    let privacySettings: PrivacySettings?
    
    enum CodingKeys: String, CodingKey {
        case id, email, username, bio, website, location
        case displayName = "display_name"
        case firstName = "first_name"
        case lastName = "last_name"
        case avatarURL = "avatar_url"
        case isVerified = "is_verified"
        case isPrivate = "is_private"
        case followersCount = "followers_count"
        case followingCount = "following_count"
        case postsCount = "posts_count"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case socialMediaLinks = "social_media_links"
        case notificationSettings = "notification_settings"
        case privacySettings = "privacy_settings"
    }
}

// MARK: - Social Media Links

struct SocialMediaLinks: Codable, Hashable {
    let twitter: String?
    let instagram: String?
    let linkedin: String?
    let github: String?
    let youtube: String?
    let tiktok: String?
    let facebook: String?
}

// MARK: - Notification Settings

struct NotificationSettings: Codable, Hashable {
    let pushNotifications: Bool
    let emailNotifications: Bool
    let followNotifications: Bool
    let likeNotifications: Bool
    let commentNotifications: Bool
    let messageNotifications: Bool
    let marketplaceNotifications: Bool
    let courseNotifications: Bool
    
    enum CodingKeys: String, CodingKey {
        case pushNotifications = "push_notifications"
        case emailNotifications = "email_notifications"
        case followNotifications = "follow_notifications"
        case likeNotifications = "like_notifications"
        case commentNotifications = "comment_notifications"
        case messageNotifications = "message_notifications"
        case marketplaceNotifications = "marketplace_notifications"
        case courseNotifications = "course_notifications"
    }
}

// MARK: - Privacy Settings

struct PrivacySettings: Codable, Hashable {
    let profileVisibility: ProfileVisibility
    let messagePermissions: MessagePermissions
    let taggingPermissions: TaggingPermissions
    let dataSharing: Bool
    let analyticsOptOut: Bool
    
    enum CodingKeys: String, CodingKey {
        case profileVisibility = "profile_visibility"
        case messagePermissions = "message_permissions"
        case taggingPermissions = "tagging_permissions"
        case dataSharing = "data_sharing"
        case analyticsOptOut = "analytics_opt_out"
    }
    
    enum ProfileVisibility: String, Codable, CaseIterable {
        case everyone = "everyone"
        case followers = "followers"
        case private = "private"
        
        var displayName: String {
            switch self {
            case .everyone: return "Everyone"
            case .followers: return "Followers Only"
            case .private: return "Private"
            }
        }
    }
    
    enum MessagePermissions: String, Codable, CaseIterable {
        case everyone = "everyone"
        case followers = "followers"
        case none = "none"
        
        var displayName: String {
            switch self {
            case .everyone: return "Everyone"
            case .followers: return "Followers Only"
            case .none: return "No One"
            }
        }
    }
    
    enum TaggingPermissions: String, Codable, CaseIterable {
        case everyone = "everyone"
        case followers = "followers"
        case none = "none"
        
        var displayName: String {
            switch self {
            case .everyone: return "Everyone"
            case .followers: return "Followers Only"
            case .none: return "No One"
            }
        }
    }
}

// MARK: - User Extensions

extension User {
    var fullName: String {
        let first = firstName ?? ""
        let last = lastName ?? ""
        
        if first.isEmpty && last.isEmpty {
            return displayName
        }
        
        return "\(first) \(last)".trimmingCharacters(in: .whitespaces)
    }
    
    var initials: String {
        let components = displayName.components(separatedBy: " ")
        let initials = components.compactMap { $0.first }.map { String($0) }.joined()
        return String(initials.prefix(2)).uppercased()
    }
    
    var isCurrentUser: Bool {
        // This would be compared with the current user's ID
        return UserDefaults.standard.string(forKey: "currentUserId") == id
    }
    
    func formattedFollowersCount() -> String {
        return formatCount(followersCount)
    }
    
    func formattedFollowingCount() -> String {
        return formatCount(followingCount)
    }
    
    func formattedPostsCount() -> String {
        return formatCount(postsCount)
    }
    
    private func formatCount(_ count: Int) -> String {
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
}

// MARK: - Authentication Models

struct AuthResponse: Codable {
    let user: User
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
    
    enum CodingKeys: String, CodingKey {
        case user
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresIn = "expires_in"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let username: String
    let displayName: String
    let firstName: String?
    let lastName: String?
    
    enum CodingKeys: String, CodingKey {
        case email, password, username
        case displayName = "display_name"
        case firstName = "first_name"
        case lastName = "last_name"
    }
}

struct AppleSignInRequest: Codable {
    let identityToken: String
    let authorizationCode: String
    let email: String?
    let firstName: String?
    let lastName: String?
    
    enum CodingKeys: String, CodingKey {
        case identityToken = "identity_token"
        case authorizationCode = "authorization_code"
        case email
        case firstName = "first_name"
        case lastName = "last_name"
    }
}

struct GoogleSignInRequest: Codable {
    let idToken: String
    let accessToken: String
    
    enum CodingKeys: String, CodingKey {
        case idToken = "id_token"
        case accessToken = "access_token"
    }
}

struct RefreshTokenRequest: Codable {
    let refreshToken: String
    
    enum CodingKeys: String, CodingKey {
        case refreshToken = "refresh_token"
    }
}

// MARK: - Profile Update Models

struct UpdateProfileRequest: Codable {
    let displayName: String?
    let firstName: String?
    let lastName: String?
    let bio: String?
    let website: String?
    let location: String?
    let isPrivate: Bool?
    let socialMediaLinks: SocialMediaLinks?
    
    enum CodingKeys: String, CodingKey {
        case bio, website, location
        case displayName = "display_name"
        case firstName = "first_name"
        case lastName = "last_name"
        case isPrivate = "is_private"
        case socialMediaLinks = "social_media_links"
    }
}

struct UpdateNotificationSettingsRequest: Codable {
    let notificationSettings: NotificationSettings
    
    enum CodingKeys: String, CodingKey {
        case notificationSettings = "notification_settings"
    }
}

struct UpdatePrivacySettingsRequest: Codable {
    let privacySettings: PrivacySettings
    
    enum CodingKeys: String, CodingKey {
        case privacySettings = "privacy_settings"
    }
}

// MARK: - Follow Models

struct FollowResponse: Codable {
    let isFollowing: Bool
    let followerCount: Int
    
    enum CodingKeys: String, CodingKey {
        case isFollowing = "is_following"
        case followerCount = "follower_count"
    }
}

struct FollowerUser: Codable, Identifiable {
    let id: String
    let username: String
    let displayName: String
    let avatarURL: String?
    let isVerified: Bool
    let isFollowing: Bool
    let followedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id, username, isVerified
        case displayName = "display_name"
        case avatarURL = "avatar_url"
        case isFollowing = "is_following"
        case followedAt = "followed_at"
    }
}