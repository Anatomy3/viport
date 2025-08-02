import SwiftUI
import Combine

struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()
    @State private var showingCreatePost = false
    @State private var showingStoryCamera = false
    @State private var selectedStoryUser: User?
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 0) {
                    // Stories Section
                    if !viewModel.stories.isEmpty {
                        StoriesScrollView(
                            stories: viewModel.stories,
                            onStoryTap: { story in
                                selectedStoryUser = story.user
                            },
                            onAddStoryTap: {
                                showingStoryCamera = true
                            }
                        )
                        .padding(.bottom, 16)
                    }
                    
                    // Posts Feed
                    ForEach(viewModel.feedItems) { feedItem in
                        switch feedItem.type {
                        case .post:
                            if let post = feedItem.post {
                                PostCardView(
                                    post: post,
                                    onLikeTap: { viewModel.toggleLike(postId: post.id) },
                                    onCommentTap: { /* Navigate to comments */ },
                                    onShareTap: { viewModel.sharePost(post) },
                                    onSaveTap: { viewModel.toggleSave(postId: post.id) },
                                    onProfileTap: { /* Navigate to profile */ },
                                    onMoreTap: { /* Show more options */ }
                                )
                                .padding(.bottom, 16)
                            }
                        case .advertisement:
                            if let ad = feedItem.advertisement {
                                AdvertisementCardView(advertisement: ad)
                                    .padding(.bottom, 16)
                            }
                        default:
                            EmptyView()
                        }
                    }
                    
                    // Loading indicator
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(height: 50)
                    }
                    
                    // Load more trigger
                    Color.clear
                        .frame(height: 1)
                        .onAppear {
                            viewModel.loadMorePosts()
                        }
                }
            }
            .refreshable {
                await viewModel.refreshFeed()
            }
            .navigationTitle("Feed")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        // Open notifications
                    } label: {
                        Image(systemName: "bell")
                            .foregroundColor(.primary)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingCreatePost = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundColor(.primary)
                    }
                }
            }
        }
        .onAppear {
            viewModel.loadInitialData()
        }
        .sheet(isPresented: $showingCreatePost) {
            CreatePostView()
        }
        .sheet(isPresented: $showingStoryCamera) {
            StoryCreationView()
        }
        .sheet(item: $selectedStoryUser) { user in
            StoriesViewer(user: user, stories: viewModel.stories.filter { $0.userId == user.id })
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.clearError()
            }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }
}

// MARK: - Stories Scroll View

struct StoriesScrollView: View {
    let stories: [Story]
    let onStoryTap: (Story) -> Void
    let onAddStoryTap: () -> Void
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            LazyHStack(spacing: 12) {
                // Add Story Button
                AddStoryButton(onTap: onAddStoryTap)
                
                // Stories
                ForEach(stories) { story in
                    StoryCircleView(
                        story: story,
                        onTap: { onStoryTap(story) }
                    )
                }
            }
            .padding(.horizontal, 16)
        }
    }
}

// MARK: - Add Story Button

struct AddStoryButton: View {
    let onTap: () -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .fill(Color(.systemGray6))
                    .frame(width: 64, height: 64)
                
                Circle()
                    .stroke(Color(.systemGray4), lineWidth: 2)
                    .frame(width: 64, height: 64)
                
                Image(systemName: "plus")
                    .font(.system(size: 24, weight: .medium))
                    .foregroundColor(.primary)
            }
            .onTapGesture {
                onTap()
            }
            
            Text("Your Story")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.secondary)
                .frame(width: 70)
                .lineLimit(1)
        }
    }
}

// MARK: - Story Circle View

struct StoryCircleView: View {
    let story: Story
    let onTap: () -> Void
    
    @State private var imageScale: CGFloat = 1.0
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                // Gradient border for unviewed stories
                if !story.isViewed {
                    Circle()
                        .fill(
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.purple,
                                    Color.pink,
                                    Color.orange
                                ]),
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 68, height: 68)
                }
                
                // Story image
                AsyncImage(url: URL(string: story.mediaItem.thumbnailURL ?? story.mediaItem.url)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Circle()
                        .fill(Color(.systemGray5))
                        .overlay(
                            ProgressView()
                                .scaleEffect(0.8)
                        )
                }
                .frame(width: 64, height: 64)
                .clipShape(Circle())
                .scaleEffect(imageScale)
                .onTapGesture {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        imageScale = 0.95
                    }
                    
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                            imageScale = 1.0
                        }
                        onTap()
                    }
                }
                
                // Viewed overlay
                if story.isViewed {
                    Circle()
                        .stroke(Color(.systemGray4), lineWidth: 2)
                        .frame(width: 64, height: 64)
                }
            }
            
            Text(story.user.displayName)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.primary)
                .frame(width: 70)
                .lineLimit(1)
        }
    }
}

// MARK: - Post Card View

struct PostCardView: View {
    let post: Post
    let onLikeTap: () -> Void
    let onCommentTap: () -> Void
    let onShareTap: () -> Void
    let onSaveTap: () -> Void
    let onProfileTap: () -> Void
    let onMoreTap: () -> Void
    
    @State private var isLiked: Bool
    @State private var isSaved: Bool
    @State private var likesCount: Int
    @State private var showingFullCaption = false
    
    init(
        post: Post,
        onLikeTap: @escaping () -> Void,
        onCommentTap: @escaping () -> Void,
        onShareTap: @escaping () -> Void,
        onSaveTap: @escaping () -> Void,
        onProfileTap: @escaping () -> Void,
        onMoreTap: @escaping () -> Void
    ) {
        self.post = post
        self.onLikeTap = onLikeTap
        self.onCommentTap = onCommentTap
        self.onShareTap = onShareTap
        self.onSaveTap = onSaveTap
        self.onProfileTap = onProfileTap
        self.onMoreTap = onMoreTap
        
        _isLiked = State(initialValue: post.isLiked)
        _isSaved = State(initialValue: post.isSaved)
        _likesCount = State(initialValue: post.likesCount)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Post Header
            PostHeaderView(
                user: post.user,
                createdAt: post.formattedCreatedAt,
                location: post.location,
                onProfileTap: onProfileTap,
                onMoreTap: onMoreTap
            )
            .padding(.horizontal, 16)
            .padding(.bottom, 12)
            
            // Post Media
            if post.hasMedia {
                PostMediaView(mediaItems: post.mediaItems)
            }
            
            // Post Actions
            PostActionsView(
                isLiked: isLiked,
                isSaved: isSaved,
                onLikeTap: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        isLiked.toggle()
                        likesCount += isLiked ? 1 : -1
                    }
                    onLikeTap()
                },
                onCommentTap: onCommentTap,
                onShareTap: onShareTap,
                onSaveTap: {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isSaved.toggle()
                    }
                    onSaveTap()
                }
            )
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            
            // Post Stats
            PostStatsView(
                likesCount: likesCount,
                commentsCount: post.commentsCount,
                viewsCount: post.viewsCount
            )
            .padding(.horizontal, 16)
            .padding(.bottom, 8)
            
            // Post Caption
            if let content = post.content, !content.isEmpty {
                PostCaptionView(
                    user: post.user,
                    content: content,
                    tags: post.tags,
                    showingFullCaption: $showingFullCaption
                )
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
            }
        }
        .background(Color(.systemBackground))
        .onChange(of: post.isLiked) { newValue in
            isLiked = newValue
        }
        .onChange(of: post.isSaved) { newValue in
            isSaved = newValue
        }
        .onChange(of: post.likesCount) { newValue in
            likesCount = newValue
        }
    }
}

// MARK: - Post Header View

struct PostHeaderView: View {
    let user: User
    let createdAt: String
    let location: Location?
    let onProfileTap: () -> Void
    let onMoreTap: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            // Profile Picture
            AsyncImage(url: URL(string: user.avatarURL ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Circle()
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                Color("PrimaryColor"),
                                Color("SecondaryColor")
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .overlay(
                        Text(user.initials)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                    )
            }
            .frame(width: 44, height: 44)
            .clipShape(Circle())
            .onTapGesture {
                onProfileTap()
            }
            
            // User Info
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 4) {
                    Text(user.displayName)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    if user.isVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 14))
                            .foregroundColor(.blue)
                    }
                }
                
                HStack(spacing: 4) {
                    Text(createdAt)
                        .font(.system(size: 13))
                        .foregroundColor(.secondary)
                    
                    if let location = location {
                        Text("•")
                            .font(.system(size: 13))
                            .foregroundColor(.secondary)
                        
                        Text(location.name)
                            .font(.system(size: 13))
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }
            }
            
            Spacer()
            
            // More Button
            Button(action: onMoreTap) {
                Image(systemName: "ellipsis")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
                    .frame(width: 24, height: 24)
            }
        }
    }
}

// MARK: - Placeholder Views

struct PostMediaView: View {
    let mediaItems: [MediaItem]
    
    var body: some View {
        if mediaItems.count == 1 {
            SingleMediaView(mediaItem: mediaItems.first!)
        } else {
            CarouselMediaView(mediaItems: mediaItems)
        }
    }
}

struct SingleMediaView: View {
    let mediaItem: MediaItem
    
    var body: some View {
        AsyncImage(url: URL(string: mediaItem.url)) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fit)
        } placeholder: {
            Rectangle()
                .fill(Color(.systemGray6))
                .aspectRatio(1, contentMode: .fit)
                .overlay(
                    ProgressView()
                )
        }
    }
}

struct CarouselMediaView: View {
    let mediaItems: [MediaItem]
    
    var body: some View {
        TabView {
            ForEach(mediaItems) { mediaItem in
                SingleMediaView(mediaItem: mediaItem)
            }
        }
        .tabViewStyle(PageTabViewStyle())
        .frame(height: 400)
    }
}

struct PostActionsView: View {
    let isLiked: Bool
    let isSaved: Bool
    let onLikeTap: () -> Void
    let onCommentTap: () -> Void
    let onShareTap: () -> Void
    let onSaveTap: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            // Like Button
            Button(action: onLikeTap) {
                Image(systemName: isLiked ? "heart.fill" : "heart")
                    .font(.system(size: 22))
                    .foregroundColor(isLiked ? .red : .primary)
                    .scaleEffect(isLiked ? 1.1 : 1.0)
            }
            
            // Comment Button
            Button(action: onCommentTap) {
                Image(systemName: "bubble.right")
                    .font(.system(size: 22))
                    .foregroundColor(.primary)
            }
            
            // Share Button
            Button(action: onShareTap) {
                Image(systemName: "paperplane")
                    .font(.system(size: 22))
                    .foregroundColor(.primary)
            }
            
            Spacer()
            
            // Save Button
            Button(action: onSaveTap) {
                Image(systemName: isSaved ? "bookmark.fill" : "bookmark")
                    .font(.system(size: 20))
                    .foregroundColor(isSaved ? .primary : .secondary)
            }
        }
    }
}

struct PostStatsView: View {
    let likesCount: Int
    let commentsCount: Int
    let viewsCount: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if likesCount > 0 {
                Text("\(likesCount) likes")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
            }
            
            if commentsCount > 0 {
                Text("View all \(commentsCount) comments")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
        }
    }
}

struct PostCaptionView: View {
    let user: User
    let content: String
    let tags: [String]
    @Binding var showingFullCaption: Bool
    
    private let maxCaptionLength = 100
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .top, spacing: 4) {
                Text(user.displayName)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
                
                Text(displayContent)
                    .font(.system(size: 14))
                    .foregroundColor(.primary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            if !tags.isEmpty {
                Text(tags.map { "#\($0)" }.joined(separator: " "))
                    .font(.system(size: 14))
                    .foregroundColor(.blue)
            }
        }
    }
    
    private var displayContent: String {
        if content.count <= maxCaptionLength || showingFullCaption {
            return content
        } else {
            return String(content.prefix(maxCaptionLength)) + "... more"
        }
    }
}

struct AdvertisementCardView: View {
    let advertisement: Advertisement
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Sponsored")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button("•••") {
                    // Handle ad options
                }
                .font(.system(size: 14))
                .foregroundColor(.secondary)
            }
            
            AsyncImage(url: URL(string: advertisement.imageURL)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            } placeholder: {
                Rectangle()
                    .fill(Color(.systemGray6))
                    .aspectRatio(16/9, contentMode: .fit)
                    .overlay(ProgressView())
            }
            .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(advertisement.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.primary)
                
                Text(advertisement.description)
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                Button(advertisement.actionText) {
                    // Handle ad action
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.blue)
            }
        }
        .padding(16)
        .background(Color(.systemBackground))
    }
}

// MARK: - Placeholder Views for Sheets

struct CreatePostView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Text("Create Post - Coming Soon")
                .navigationTitle("New Post")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            dismiss()
                        }
                    }
                }
        }
    }
}

struct StoryCreationView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Text("Story Creation - Coming Soon")
                .navigationTitle("Your Story")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            dismiss()
                        }
                    }
                }
        }
    }
}

struct StoriesViewer: View {
    let user: User
    let stories: [Story]
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Text("Stories Viewer - Coming Soon")
                .navigationTitle(user.displayName)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Close") {
                            dismiss()
                        }
                    }
                }
        }
    }
}

#Preview {
    FeedView()
}