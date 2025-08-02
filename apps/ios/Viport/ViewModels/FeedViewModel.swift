import Foundation
import Combine

@MainActor
class FeedViewModel: ObservableObject {
    @Published var feedItems: [FeedItem] = []
    @Published var stories: [Story] = []
    @Published var isLoading = false
    @Published var isRefreshing = false
    @Published var errorMessage: String?
    @Published var hasMorePosts = true
    
    private let apiService = APIService.shared
    private var cancellables = Set<AnyCancellable>()
    private var currentPage = 1
    private let postsPerPage = 10
    
    // MARK: - Initialization
    
    init() {
        setupBindings()
    }
    
    // MARK: - Public Methods
    
    func loadInitialData() {
        guard feedItems.isEmpty else { return }
        
        isLoading = true
        currentPage = 1
        
        Task {
            await loadFeedData()
            await loadStories()
        }
    }
    
    func refreshFeed() async {
        isRefreshing = true
        currentPage = 1
        hasMorePosts = true
        
        await loadFeedData()
        await loadStories()
        
        isRefreshing = false
    }
    
    func loadMorePosts() {
        guard !isLoading && hasMorePosts else { return }
        
        currentPage += 1
        
        Task {
            await loadFeedData(append: true)
        }
    }
    
    func toggleLike(postId: String) {
        // Optimistic update
        if let index = feedItems.firstIndex(where: { $0.post?.id == postId }) {
            var updatedPost = feedItems[index].post!
            updatedPost = Post(
                id: updatedPost.id,
                userId: updatedPost.userId,
                user: updatedPost.user,
                content: updatedPost.content,
                mediaItems: updatedPost.mediaItems,
                tags: updatedPost.tags,
                location: updatedPost.location,
                isLiked: !updatedPost.isLiked,
                isSaved: updatedPost.isSaved,
                likesCount: updatedPost.isLiked ? updatedPost.likesCount - 1 : updatedPost.likesCount + 1,
                commentsCount: updatedPost.commentsCount,
                sharesCount: updatedPost.sharesCount,
                viewsCount: updatedPost.viewsCount,
                createdAt: updatedPost.createdAt,
                updatedAt: updatedPost.updatedAt,
                postType: updatedPost.postType,
                engagementRate: updatedPost.engagementRate,
                visibility: updatedPost.visibility
            )
            
            feedItems[index] = FeedItem(
                id: feedItems[index].id,
                type: feedItems[index].type,
                post: updatedPost,
                story: feedItems[index].story,
                advertisement: feedItems[index].advertisement
            )
        }
        
        Task {
            await performLikeAction(postId: postId)
        }
    }
    
    func toggleSave(postId: String) {
        // Optimistic update
        if let index = feedItems.firstIndex(where: { $0.post?.id == postId }) {
            var updatedPost = feedItems[index].post!
            updatedPost = Post(
                id: updatedPost.id,
                userId: updatedPost.userId,
                user: updatedPost.user,
                content: updatedPost.content,
                mediaItems: updatedPost.mediaItems,
                tags: updatedPost.tags,
                location: updatedPost.location,
                isLiked: updatedPost.isLiked,
                isSaved: !updatedPost.isSaved,
                likesCount: updatedPost.likesCount,
                commentsCount: updatedPost.commentsCount,
                sharesCount: updatedPost.sharesCount,
                viewsCount: updatedPost.viewsCount,
                createdAt: updatedPost.createdAt,
                updatedAt: updatedPost.updatedAt,
                postType: updatedPost.postType,
                engagementRate: updatedPost.engagementRate,
                visibility: updatedPost.visibility
            )
            
            feedItems[index] = FeedItem(
                id: feedItems[index].id,
                type: feedItems[index].type,
                post: updatedPost,
                story: feedItems[index].story,
                advertisement: feedItems[index].advertisement
            )
        }
        
        Task {
            await performSaveAction(postId: postId)
        }
    }
    
    func sharePost(_ post: Post) {
        // Handle post sharing
        let shareText = "Check out this post from \(post.user.displayName) on Viport!"
        let activityItems: [Any] = [shareText]
        
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let rootViewController = window.rootViewController {
            
            let activityViewController = UIActivityViewController(
                activityItems: activityItems,
                applicationActivities: nil
            )
            
            rootViewController.present(activityViewController, animated: true)
        }
    }
    
    func clearError() {
        errorMessage = nil
    }
    
    // MARK: - Private Methods
    
    private func setupBindings() {
        // You can add Combine bindings here if needed
    }
    
    private func loadFeedData(append: Bool = false) async {
        do {
            let response: PostsResponse = try await apiService.request(
                endpoint: .posts,
                method: .get,
                parameters: [
                    "page": currentPage,
                    "per_page": postsPerPage
                ],
                responseType: PostsResponse.self
            )
            
            let newFeedItems = response.posts.map { post in
                FeedItem(
                    id: post.id,
                    type: .post,
                    post: post,
                    story: nil,
                    advertisement: nil
                )
            }
            
            if append {
                feedItems.append(contentsOf: newFeedItems)
            } else {
                feedItems = newFeedItems
            }
            
            hasMorePosts = response.hasMore
            isLoading = false
            
        } catch {
            handleError(error)
        }
    }
    
    private func loadStories() async {
        do {
            let response: [Story] = try await apiService.request(
                endpoint: APIEndpoint.stories,
                responseType: [Story].self
            )
            
            stories = response
            
        } catch {
            print("❌ Failed to load stories: \(error)")
            // Don't show error for stories failure
        }
    }
    
    private func performLikeAction(postId: String) async {
        do {
            let endpoint: APIEndpoint = feedItems.first(where: { $0.post?.id == postId })?.post?.isLiked == true
                ? .unlikePost(postId)
                : .likePost(postId)
            
            let _: LikeResponse = try await apiService.request(
                endpoint: endpoint,
                method: .post,
                responseType: LikeResponse.self
            )
            
            // The optimistic update should already be applied
            
        } catch {
            // Revert optimistic update on error
            if let index = feedItems.firstIndex(where: { $0.post?.id == postId }) {
                var updatedPost = feedItems[index].post!
                updatedPost = Post(
                    id: updatedPost.id,
                    userId: updatedPost.userId,
                    user: updatedPost.user,
                    content: updatedPost.content,
                    mediaItems: updatedPost.mediaItems,
                    tags: updatedPost.tags,
                    location: updatedPost.location,
                    isLiked: !updatedPost.isLiked,
                    isSaved: updatedPost.isSaved,
                    likesCount: updatedPost.isLiked ? updatedPost.likesCount + 1 : updatedPost.likesCount - 1,
                    commentsCount: updatedPost.commentsCount,
                    sharesCount: updatedPost.sharesCount,
                    viewsCount: updatedPost.viewsCount,
                    createdAt: updatedPost.createdAt,
                    updatedAt: updatedPost.updatedAt,
                    postType: updatedPost.postType,
                    engagementRate: updatedPost.engagementRate,
                    visibility: updatedPost.visibility
                )
                
                feedItems[index] = FeedItem(
                    id: feedItems[index].id,
                    type: feedItems[index].type,
                    post: updatedPost,
                    story: feedItems[index].story,
                    advertisement: feedItems[index].advertisement
                )
            }
            
            handleError(error)
        }
    }
    
    private func performSaveAction(postId: String) async {
        do {
            let endpoint: APIEndpoint = feedItems.first(where: { $0.post?.id == postId })?.post?.isSaved == true
                ? .unsavePost(postId)
                : .savePost(postId)
            
            let _: SaveResponse = try await apiService.request(
                endpoint: endpoint,
                method: .post,
                responseType: SaveResponse.self
            )
            
            // The optimistic update should already be applied
            
        } catch {
            // Revert optimistic update on error
            if let index = feedItems.firstIndex(where: { $0.post?.id == postId }) {
                var updatedPost = feedItems[index].post!
                updatedPost = Post(
                    id: updatedPost.id,
                    userId: updatedPost.userId,
                    user: updatedPost.user,
                    content: updatedPost.content,
                    mediaItems: updatedPost.mediaItems,
                    tags: updatedPost.tags,
                    location: updatedPost.location,
                    isLiked: updatedPost.isLiked,
                    isSaved: !updatedPost.isSaved,
                    likesCount: updatedPost.likesCount,
                    commentsCount: updatedPost.commentsCount,
                    sharesCount: updatedPost.sharesCount,
                    viewsCount: updatedPost.viewsCount,
                    createdAt: updatedPost.createdAt,
                    updatedAt: updatedPost.updatedAt,
                    postType: updatedPost.postType,
                    engagementRate: updatedPost.engagementRate,
                    visibility: updatedPost.visibility
                )
                
                feedItems[index] = FeedItem(
                    id: feedItems[index].id,
                    type: feedItems[index].type,
                    post: updatedPost,
                    story: feedItems[index].story,
                    advertisement: feedItems[index].advertisement
                )
            }
            
            handleError(error)
        }
    }
    
    private func handleError(_ error: Error) {
        isLoading = false
        isRefreshing = false
        
        if let apiError = error as? APIError {
            errorMessage = apiError.localizedDescription
        } else {
            errorMessage = error.localizedDescription
        }
        
        print("❌ Feed error: \(error)")
    }
}

// MARK: - Mock Data Extension

extension FeedViewModel {
    static func createMockData() -> [FeedItem] {
        let mockUser = User(
            id: "1",
            email: "john@example.com",
            username: "johndoe",
            displayName: "John Doe",
            firstName: "John",
            lastName: "Doe",
            avatarURL: nil,
            bio: "iOS Developer",
            website: nil,
            location: "San Francisco",
            isVerified: true,
            isPrivate: false,
            followersCount: 1250,
            followingCount: 342,
            postsCount: 89,
            createdAt: Date(),
            updatedAt: Date(),
            socialMediaLinks: nil,
            notificationSettings: nil,
            privacySettings: nil
        )
        
        let mockMediaItem = MediaItem(
            id: "1",
            url: "https://picsum.photos/400/400",
            thumbnailURL: "https://picsum.photos/400/400",
            type: .image,
            width: 400,
            height: 400,
            duration: nil,
            size: 1024000,
            altText: "Mock image",
            order: 0
        )
        
        let mockPost = Post(
            id: "1",
            userId: "1",
            user: mockUser,
            content: "This is a mock post for testing the feed UI. It contains some sample text to demonstrate how the post looks.",
            mediaItems: [mockMediaItem],
            tags: ["ios", "swiftui", "development"],
            location: Location(
                id: "1",
                name: "San Francisco, CA",
                address: "San Francisco, California, USA",
                latitude: 37.7749,
                longitude: -122.4194,
                city: "San Francisco",
                country: "USA"
            ),
            isLiked: false,
            isSaved: false,
            likesCount: 234,
            commentsCount: 12,
            sharesCount: 5,
            viewsCount: 1890,
            createdAt: Date().addingTimeInterval(-3600), // 1 hour ago
            updatedAt: Date().addingTimeInterval(-3600),
            postType: .image,
            engagementRate: 0.124,
            visibility: .public
        )
        
        return [
            FeedItem(
                id: "1",
                type: .post,
                post: mockPost,
                story: nil,
                advertisement: nil
            )
        ]
    }
    
    static func createMockStories() -> [Story] {
        let mockUser = User(
            id: "2",
            email: "jane@example.com",
            username: "janedoe",
            displayName: "Jane Doe",
            firstName: "Jane",
            lastName: "Doe",
            avatarURL: nil,
            bio: "Designer",
            website: nil,
            location: "New York",
            isVerified: false,
            isPrivate: false,
            followersCount: 890,
            followingCount: 234,
            postsCount: 45,
            createdAt: Date(),
            updatedAt: Date(),
            socialMediaLinks: nil,
            notificationSettings: nil,
            privacySettings: nil
        )
        
        let mockMediaItem = MediaItem(
            id: "2",
            url: "https://picsum.photos/300/400",
            thumbnailURL: "https://picsum.photos/300/400",
            type: .image,
            width: 300,
            height: 400,
            duration: nil,
            size: 856000,
            altText: "Story image",
            order: 0
        )
        
        return [
            Story(
                id: "1",
                userId: "2",
                user: mockUser,
                mediaItem: mockMediaItem,
                isViewed: false,
                viewsCount: 156,
                expiresAt: Date().addingTimeInterval(86400), // 24 hours from now
                createdAt: Date().addingTimeInterval(-7200) // 2 hours ago
            )
        ]
    }
}

// MARK: - Additional API Endpoints

extension APIEndpoint {
    static let stories = APIEndpoint.posts // Replace with actual stories endpoint
    static func savePost(_ id: String) -> APIEndpoint { .posts } // Replace with actual save endpoint
    static func unsavePost(_ id: String) -> APIEndpoint { .posts } // Replace with actual unsave endpoint
}