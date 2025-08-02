import SwiftUI
import Firebase
import GoogleSignIn
import UserNotifications

@main
struct ViportApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var networkMonitor = NetworkMonitor()
    @StateObject private var notificationManager = NotificationManager()
    
    init() {
        setupFirebase()
        setupGoogleSignIn()
        setupAppearance()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(networkMonitor)
                .environmentObject(notificationManager)
                .onAppear {
                    setupNotifications()
                    appState.checkAuthenticationStatus()
                }
                .onOpenURL { url in
                    handleDeepLink(url)
                }
        }
    }
    
    // MARK: - Setup Methods
    
    private func setupFirebase() {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") else {
            print("⚠️ GoogleService-Info.plist not found")
            return
        }
        
        FirebaseApp.configure()
        print("✅ Firebase configured successfully")
    }
    
    private func setupGoogleSignIn() {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
              let plist = NSDictionary(contentsOfFile: path),
              let clientId = plist["CLIENT_ID"] as? String else {
            print("⚠️ Google Sign-In configuration not found")
            return
        }
        
        GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: clientId)
        print("✅ Google Sign-In configured successfully")
    }
    
    private func setupAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor.systemBackground
        appearance.titleTextAttributes = [
            .foregroundColor: UIColor.label,
            .font: UIFont.systemFont(ofSize: 18, weight: .semibold)
        ]
        appearance.largeTitleTextAttributes = [
            .foregroundColor: UIColor.label,
            .font: UIFont.systemFont(ofSize: 32, weight: .bold)
        ]
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().compactAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
        
        // Configure tab bar appearance
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor.systemBackground
        
        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        
        print("✅ App appearance configured successfully")
    }
    
    private func setupNotifications() {
        notificationManager.requestPermission()
    }
    
    private func handleDeepLink(_ url: URL) {
        print("🔗 Deep link received: \(url)")
        
        // Handle Google Sign-In callback
        if GIDSignIn.sharedInstance.handle(url) {
            return
        }
        
        // Handle custom deep links
        guard url.scheme == "viport" else { return }
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        
        switch url.host {
        case "post":
            if let postId = components?.queryItems?.first(where: { $0.name == "id" })?.value {
                appState.navigateToPost(postId)
            }
        case "profile":
            if let userId = components?.queryItems?.first(where: { $0.name == "id" })?.value {
                appState.navigateToProfile(userId)
            }
        case "product":
            if let productId = components?.queryItems?.first(where: { $0.name == "id" })?.value {
                appState.navigateToProduct(productId)
            }
        default:
            break
        }
    }
}

// MARK: - App State Management

class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = true
    @Published var currentUser: User?
    @Published var selectedTab: Tab = .feed
    @Published var deepLinkPath: String?
    
    private let authService = AuthService.shared
    private let keychainService = KeychainService.shared
    
    enum Tab: String, CaseIterable {
        case feed = "Feed"
        case marketplace = "Shop"
        case profile = "Profile"
        case learning = "Learn"
        case chat = "Chat"
        
        var icon: String {
            switch self {
            case .feed: return "house"
            case .marketplace: return "bag"
            case .profile: return "person"
            case .learning: return "book"
            case .chat: return "message"
            }
        }
        
        var selectedIcon: String {
            switch self {
            case .feed: return "house.fill"
            case .marketplace: return "bag.fill"
            case .profile: return "person.fill"
            case .learning: return "book.fill"
            case .chat: return "message.fill"
            }
        }
    }
    
    init() {
        checkAuthenticationStatus()
    }
    
    func checkAuthenticationStatus() {
        isLoading = true
        
        // Check for stored authentication token
        if let token = keychainService.getAccessToken() {
            // Validate token with backend
            Task {
                do {
                    let user = try await authService.validateToken(token)
                    await MainActor.run {
                        self.currentUser = user
                        self.isAuthenticated = true
                        self.isLoading = false
                    }
                } catch {
                    await MainActor.run {
                        self.logout()
                    }
                }
            }
        } else {
            isAuthenticated = false
            isLoading = false
        }
    }
    
    func login(user: User, token: String) {
        keychainService.saveAccessToken(token)
        currentUser = user
        isAuthenticated = true
    }
    
    func logout() {
        keychainService.clearAccessToken()
        currentUser = nil
        isAuthenticated = false
        selectedTab = .feed
        deepLinkPath = nil
    }
    
    func navigateToPost(_ postId: String) {
        selectedTab = .feed
        deepLinkPath = "post/\(postId)"
    }
    
    func navigateToProfile(_ userId: String) {
        selectedTab = .profile
        deepLinkPath = "profile/\(userId)"
    }
    
    func navigateToProduct(_ productId: String) {
        selectedTab = .marketplace
        deepLinkPath = "product/\(productId)"
    }
}

// MARK: - Network Monitoring

class NetworkMonitor: ObservableObject {
    @Published var isConnected = true
    @Published var connectionType: ConnectionType = .wifi
    
    enum ConnectionType {
        case wifi
        case cellular
        case none
    }
    
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "NetworkMonitor")
    
    init() {
        startMonitoring()
    }
    
    private func startMonitoring() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                
                if path.usesInterfaceType(.wifi) {
                    self?.connectionType = .wifi
                } else if path.usesInterfaceType(.cellular) {
                    self?.connectionType = .cellular
                } else {
                    self?.connectionType = .none
                }
            }
        }
        
        monitor.start(queue: queue)
    }
    
    deinit {
        monitor.cancel()
    }
}

// MARK: - Notification Management

class NotificationManager: ObservableObject {
    @Published var hasPermission = false
    
    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                self.hasPermission = granted
            }
            
            if let error = error {
                print("❌ Notification permission error: \(error)")
            }
        }
    }
    
    func scheduleLocalNotification(title: String, body: String, identifier: String, delay: TimeInterval = 0) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: max(delay, 1), repeats: false)
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ Failed to schedule notification: \(error)")
            }
        }
    }
}

// MARK: - Import required frameworks
import Network