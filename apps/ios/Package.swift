// swift-tools-version: 5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Viport",
    platforms: [
        .iOS(.v15),
        .macOS(.v12)
    ],
    products: [
        .library(
            name: "Viport",
            targets: ["Viport"]),
    ],
    dependencies: [
        // Alamofire for networking
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
        // Kingfisher for image loading and caching
        .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.10.0"),
        // KeychainAccess for secure storage
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess.git", from: "4.2.2"),
        // SwiftyJSON for JSON parsing
        .package(url: "https://github.com/SwiftyJSON/SwiftyJSON.git", from: "5.0.1"),
        // Firebase for push notifications and analytics
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "10.18.0"),
        // Google Sign-In
        .package(url: "https://github.com/google/GoogleSignIn-iOS.git", from: "7.0.0"),
        // Lottie for animations
        .package(url: "https://github.com/airbnb/lottie-ios.git", from: "4.4.0"),
        // SocketIO for real-time communication
        .package(url: "https://github.com/socketio/socket.io-client-swift.git", from: "16.1.0")
    ],
    targets: [
        .target(
            name: "Viport",
            dependencies: [
                "Alamofire",
                "Kingfisher",
                "KeychainAccess",
                "SwiftyJSON",
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseMessaging", package: "firebase-ios-sdk"),
                .product(name: "FirebaseAnalytics", package: "firebase-ios-sdk"),
                .product(name: "GoogleSignIn", package: "GoogleSignIn-iOS"),
                .product(name: "Lottie", package: "lottie-ios"),
                .product(name: "SocketIO", package: "socket.io-client-swift")
            ]),
        .testTarget(
            name: "ViportTests",
            dependencies: ["Viport"]),
    ]
)