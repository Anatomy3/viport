import Foundation
import KeychainAccess
import LocalAuthentication

// MARK: - Keychain Service

class KeychainService {
    static let shared = KeychainService()
    
    private let keychain: Keychain
    private let biometricKeychain: Keychain
    
    // Keychain keys
    private struct Keys {
        static let accessToken = "access_token"
        static let refreshToken = "refresh_token"
        static let userId = "user_id"
        static let userEmail = "user_email"
        static let biometricEnabled = "biometric_enabled"
        static let appPassword = "app_password"
    }
    
    private init() {
        // Standard keychain for regular data
        keychain = Keychain(service: "com.viport.app")
            .synchronizable(false)
            .accessibility(.whenUnlockedThisDeviceOnly)
        
        // Biometric keychain for sensitive data
        biometricKeychain = Keychain(service: "com.viport.app.biometric")
            .synchronizable(false)
            .accessibility(.biometryAny)
    }
    
    // MARK: - Token Management
    
    func saveAccessToken(_ token: String) {
        do {
            try keychain.set(token, key: Keys.accessToken)
            print("✅ Access token saved successfully")
        } catch {
            print("❌ Failed to save access token: \(error)")
        }
    }
    
    func getAccessToken() -> String? {
        do {
            return try keychain.get(Keys.accessToken)
        } catch {
            print("❌ Failed to get access token: \(error)")
            return nil
        }
    }
    
    func saveRefreshToken(_ token: String) {
        do {
            try keychain.set(token, key: Keys.refreshToken)
            print("✅ Refresh token saved successfully")
        } catch {
            print("❌ Failed to save refresh token: \(error)")
        }
    }
    
    func getRefreshToken() -> String? {
        do {
            return try keychain.get(Keys.refreshToken)
        } catch {
            print("❌ Failed to get refresh token: \(error)")
            return nil
        }
    }
    
    func clearAccessToken() {
        do {
            try keychain.remove(Keys.accessToken)
            print("✅ Access token cleared successfully")
        } catch {
            print("❌ Failed to clear access token: \(error)")
        }
    }
    
    func clearTokens() {
        do {
            try keychain.remove(Keys.accessToken)
            try keychain.remove(Keys.refreshToken)
            print("✅ All tokens cleared successfully")
        } catch {
            print("❌ Failed to clear tokens: \(error)")
        }
    }
    
    // MARK: - User Data Management
    
    func saveUserId(_ userId: String) {
        do {
            try keychain.set(userId, key: Keys.userId)
            UserDefaults.standard.set(userId, forKey: "currentUserId")
        } catch {
            print("❌ Failed to save user ID: \(error)")
        }
    }
    
    func getUserId() -> String? {
        do {
            return try keychain.get(Keys.userId)
        } catch {
            return nil
        }
    }
    
    func saveUserEmail(_ email: String) {
        do {
            try keychain.set(email, key: Keys.userEmail)
        } catch {
            print("❌ Failed to save user email: \(error)")
        }
    }
    
    func getUserEmail() -> String? {
        do {
            return try keychain.get(Keys.userEmail)
        } catch {
            return nil
        }
    }
    
    // MARK: - Biometric Authentication
    
    func isBiometricEnabled() -> Bool {
        return UserDefaults.standard.bool(forKey: Keys.biometricEnabled)
    }
    
    func setBiometricEnabled(_ enabled: Bool) {
        UserDefaults.standard.set(enabled, forKey: Keys.biometricEnabled)
    }
    
    func saveBiometricPassword(_ password: String) async throws {
        try await withCheckedThrowingContinuation { continuation in
            do {
                try biometricKeychain
                    .authenticationPrompt("Authenticate to save your password securely")
                    .set(password, key: Keys.appPassword)
                continuation.resume()
            } catch {
                continuation.resume(throwing: BiometricError.saveFailed(error))
            }
        }
    }
    
    func getBiometricPassword() async throws -> String? {
        return try await withCheckedThrowingContinuation { continuation in
            do {
                let password = try biometricKeychain
                    .authenticationPrompt("Authenticate to access your saved password")
                    .get(Keys.appPassword)
                continuation.resume(returning: password)
            } catch {
                if error.localizedDescription.contains("User Cancel") {
                    continuation.resume(throwing: BiometricError.userCancelled)
                } else if error.localizedDescription.contains("not available") {
                    continuation.resume(throwing: BiometricError.notAvailable)
                } else {
                    continuation.resume(throwing: BiometricError.authenticationFailed(error))
                }
            }
        }
    }
    
    func removeBiometricPassword() {
        do {
            try biometricKeychain.remove(Keys.appPassword)
            setBiometricEnabled(false)
        } catch {
            print("❌ Failed to remove biometric password: \(error)")
        }
    }
    
    // MARK: - Biometric Authentication Check
    
    func canUseBiometrics() -> (Bool, BiometricType) {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.biometryAny, error: &error) else {
            return (false, .none)
        }
        
        switch context.biometryType {
        case .faceID:
            return (true, .faceID)
        case .touchID:
            return (true, .touchID)
        case .opticID:
            return (true, .opticID)
        case .none:
            return (false, .none)
        @unknown default:
            return (false, .none)
        }
    }
    
    func authenticateWithBiometrics() async throws -> Bool {
        let context = LAContext()
        
        let (canUseBiometrics, biometricType) = self.canUseBiometrics()
        
        guard canUseBiometrics else {
            throw BiometricError.notAvailable
        }
        
        let reason = "Authenticate with \(biometricType.displayName) to access Viport"
        
        return try await withCheckedThrowingContinuation { continuation in
            context.evaluatePolicy(.biometryAny, localizedReason: reason) { success, error in
                if success {
                    continuation.resume(returning: true)
                } else if let error = error {
                    let biometricError = self.mapLAError(error)
                    continuation.resume(throwing: biometricError)
                } else {
                    continuation.resume(throwing: BiometricError.authenticationFailed(nil))
                }
            }
        }
    }
    
    private func mapLAError(_ error: Error) -> BiometricError {
        guard let laError = error as? LAError else {
            return .authenticationFailed(error)
        }
        
        switch laError.code {
        case .userCancel:
            return .userCancelled
        case .userFallback:
            return .userFallback
        case .biometryNotAvailable:
            return .notAvailable
        case .biometryNotEnrolled:
            return .notEnrolled
        case .biometryLockout:
            return .lockout
        default:
            return .authenticationFailed(error)
        }
    }
    
    // MARK: - Clear All Data
    
    func clearAllData() {
        do {
            try keychain.removeAll()
            try biometricKeychain.removeAll()
            
            UserDefaults.standard.removeObject(forKey: Keys.biometricEnabled)
            UserDefaults.standard.removeObject(forKey: "currentUserId")
            
            print("✅ All keychain data cleared successfully")
        } catch {
            print("❌ Failed to clear keychain data: \(error)")
        }
    }
}

// MARK: - Biometric Types

enum BiometricType {
    case none
    case touchID
    case faceID
    case opticID
    
    var displayName: String {
        switch self {
        case .none:
            return "None"
        case .touchID:
            return "Touch ID"
        case .faceID:
            return "Face ID"
        case .opticID:
            return "Optic ID"
        }
    }
    
    var iconName: String {
        switch self {
        case .none:
            return "lock"
        case .touchID:
            return "touchid"
        case .faceID:
            return "faceid"
        case .opticID:
            return "opticid"
        }
    }
}

// MARK: - Biometric Errors

enum BiometricError: LocalizedError {
    case notAvailable
    case notEnrolled
    case lockout
    case userCancelled
    case userFallback
    case authenticationFailed(Error?)
    case saveFailed(Error)
    
    var errorDescription: String? {
        switch self {
        case .notAvailable:
            return "Biometric authentication is not available on this device"
        case .notEnrolled:
            return "No biometric authentication is set up on this device"
        case .lockout:
            return "Biometric authentication is locked. Please use your passcode"
        case .userCancelled:
            return "Authentication was cancelled"
        case .userFallback:
            return "User chose to use alternative authentication"
        case .authenticationFailed(let error):
            return error?.localizedDescription ?? "Biometric authentication failed"
        case .saveFailed(let error):
            return "Failed to save data securely: \(error.localizedDescription)"
        }
    }
    
    var recoverySuggestion: String? {
        switch self {
        case .notAvailable:
            return "Please use password authentication instead"
        case .notEnrolled:
            return "Set up Face ID or Touch ID in Settings to use biometric authentication"
        case .lockout:
            return "Enter your device passcode to unlock biometric authentication"
        case .userCancelled, .userFallback:
            return "Try again or use password authentication"
        case .authenticationFailed:
            return "Please try again or use password authentication"
        case .saveFailed:
            return "Please check your device settings and try again"
        }
    }
}