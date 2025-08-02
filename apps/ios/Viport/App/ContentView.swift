import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var networkMonitor: NetworkMonitor
    @State private var showingSplash = true
    
    var body: some View {
        ZStack {
            if showingSplash {
                SplashView()
                    .transition(.opacity)
            } else if appState.isLoading {
                LoadingView()
                    .transition(.opacity)
            } else if appState.isAuthenticated {
                MainTabView()
                    .transition(.slide)
            } else {
                AuthenticationView()
                    .transition(.slide)
            }
            
            // Network status banner
            if !networkMonitor.isConnected {
                VStack {
                    NetworkStatusBanner()
                    Spacer()
                }
                .transition(.move(edge: .top))
            }
        }
        .animation(.easeInOut(duration: 0.5), value: showingSplash)
        .animation(.easeInOut(duration: 0.3), value: appState.isLoading)
        .animation(.easeInOut(duration: 0.3), value: appState.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: networkMonitor.isConnected)
        .onAppear {
            // Show splash screen for 2 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                showingSplash = false
            }
        }
    }
}

// MARK: - Splash View

struct SplashView: View {
    @State private var logoScale: CGFloat = 0.5
    @State private var logoOpacity: Double = 0.0
    @State private var titleOffset: CGFloat = 50
    
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(colors: [
                    Color("PrimaryColor"),
                    Color("SecondaryColor")
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Logo
                Image("AppLogo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 120, height: 120)
                    .scaleEffect(logoScale)
                    .opacity(logoOpacity)
                
                // App name
                Text("Viport")
                    .font(.system(size: 36, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .offset(y: titleOffset)
                    .opacity(logoOpacity)
                
                // Tagline
                Text("Connect. Create. Grow.")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                    .offset(y: titleOffset)
                    .opacity(logoOpacity * 0.8)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 1.0, dampingFraction: 0.6)) {
                logoScale = 1.0
                logoOpacity = 1.0
            }
            
            withAnimation(.easeOut(duration: 0.8).delay(0.3)) {
                titleOffset = 0
            }
        }
    }
}

// MARK: - Loading View

struct LoadingView: View {
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            Color("BackgroundColor")
                .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Loading animation
                Circle()
                    .stroke(
                        AngularGradient(
                            gradient: Gradient(colors: [
                                Color("PrimaryColor").opacity(0.3),
                                Color("PrimaryColor")
                            ]),
                            center: .center
                        ),
                        lineWidth: 4
                    )
                    .frame(width: 50, height: 50)
                    .rotationEffect(.degrees(isAnimating ? 360 : 0))
                    .animation(
                        .linear(duration: 1.0).repeatForever(autoreverses: false),
                        value: isAnimating
                    )
                
                Text("Loading...")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
        .onAppear {
            isAnimating = true
        }
    }
}

// MARK: - Main Tab View

struct MainTabView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        TabView(selection: $appState.selectedTab) {
            FeedView()
                .tabItem {
                    Label(
                        AppState.Tab.feed.rawValue,
                        systemImage: appState.selectedTab == .feed 
                            ? AppState.Tab.feed.selectedIcon 
                            : AppState.Tab.feed.icon
                    )
                }
                .tag(AppState.Tab.feed)
            
            MarketplaceView()
                .tabItem {
                    Label(
                        AppState.Tab.marketplace.rawValue,
                        systemImage: appState.selectedTab == .marketplace 
                            ? AppState.Tab.marketplace.selectedIcon 
                            : AppState.Tab.marketplace.icon
                    )
                }
                .tag(AppState.Tab.marketplace)
            
            LearningView()
                .tabItem {
                    Label(
                        AppState.Tab.learning.rawValue,
                        systemImage: appState.selectedTab == .learning 
                            ? AppState.Tab.learning.selectedIcon 
                            : AppState.Tab.learning.icon
                    )
                }
                .tag(AppState.Tab.learning)
            
            ChatView()
                .tabItem {
                    Label(
                        AppState.Tab.chat.rawValue,
                        systemImage: appState.selectedTab == .chat 
                            ? AppState.Tab.chat.selectedIcon 
                            : AppState.Tab.chat.icon
                    )
                }
                .tag(AppState.Tab.chat)
            
            ProfileView()
                .tabItem {
                    Label(
                        AppState.Tab.profile.rawValue,
                        systemImage: appState.selectedTab == .profile 
                            ? AppState.Tab.profile.selectedIcon 
                            : AppState.Tab.profile.icon
                    )
                }
                .tag(AppState.Tab.profile)
        }
        .accentColor(Color("PrimaryColor"))
        .onAppear {
            setupTabBarAppearance()
        }
    }
    
    private func setupTabBarAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBackground
        
        // Selected item
        appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color("PrimaryColor"))
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor(Color("PrimaryColor")),
            .font: UIFont.systemFont(ofSize: 10, weight: .semibold)
        ]
        
        // Normal item
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor.systemGray
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor.systemGray,
            .font: UIFont.systemFont(ofSize: 10, weight: .medium)
        ]
        
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
}

// MARK: - Network Status Banner

struct NetworkStatusBanner: View {
    @EnvironmentObject var networkMonitor: NetworkMonitor
    
    var body: some View {
        HStack {
            Image(systemName: "wifi.slash")
                .foregroundColor(.white)
            
            Text("No Internet Connection")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.red)
        .animation(.easeInOut(duration: 0.3), value: networkMonitor.isConnected)
    }
}

// MARK: - Placeholder Views (to be implemented)

struct FeedView: View {
    var body: some View {
        NavigationView {
            Text("Feed View - Coming Soon")
                .navigationTitle("Feed")
        }
    }
}

struct MarketplaceView: View {
    var body: some View {
        NavigationView {
            Text("Marketplace View - Coming Soon")
                .navigationTitle("Shop")
        }
    }
}

struct LearningView: View {
    var body: some View {
        NavigationView {
            Text("Learning View - Coming Soon")
                .navigationTitle("Learn")
        }
    }
}

struct ChatView: View {
    var body: some View {
        NavigationView {
            Text("Chat View - Coming Soon")
                .navigationTitle("Chat")
        }
    }
}

struct ProfileView: View {
    var body: some View {
        NavigationView {
            Text("Profile View - Coming Soon")
                .navigationTitle("Profile")
        }
    }
}

struct AuthenticationView: View {
    var body: some View {
        Text("Authentication View - Coming Soon")
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
        .environmentObject(NetworkMonitor())
        .environmentObject(NotificationManager())
}