import Foundation
import GoogleSignIn
import AuthenticationServices
import Combine

// MARK: - Authentication Service

class AuthService: ObservableObject {
    static let shared = AuthService()
    
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    private let keychainService = KeychainService.shared
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        checkAuthenticationStatus()
    }
    
    // MARK: - Authentication Status
    
    func checkAuthenticationStatus() {
        guard let token = keychainService.getAccessToken() else {
            isAuthenticated = false
            currentUser = nil
            return
        }
        
        isLoading = true
        
        Task {
            do {
                let user = try await validateToken(token)
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
    }
    
    func validateToken(_ token: String) async throws -> User {
        return try await apiService.request(
            endpoint: .profile("me"),
            responseType: User.self
        )
    }
    
    // MARK: - Email/Password Authentication
    
    @MainActor
    func login(email: String, password: String) async throws {
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        let request = LoginRequest(email: email, password: password)
        
        do {
            let response: AuthResponse = try await apiService.request(
                endpoint: .login,
                method: .post,
                parameters: request.asDictionary(),
                responseType: AuthResponse.self
            )
            
            // Save tokens and user info
            keychainService.saveAccessToken(response.accessToken)
            keychainService.saveRefreshToken(response.refreshToken)
            keychainService.saveUserId(response.user.id)
            keychainService.saveUserEmail(response.user.email)
            
            currentUser = response.user
            isAuthenticated = true
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    @MainActor
    func register(
        email: String,
        password: String,
        username: String,
        displayName: String,
        firstName: String? = nil,
        lastName: String? = nil
    ) async throws {
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        let request = RegisterRequest(
            email: email,
            password: password,
            username: username,
            displayName: displayName,
            firstName: firstName,
            lastName: lastName
        )
        
        do {
            let response: AuthResponse = try await apiService.request(
                endpoint: .register,
                method: .post,
                parameters: request.asDictionary(),
                responseType: AuthResponse.self
            )
            
            // Save tokens and user info
            keychainService.saveAccessToken(response.accessToken)
            keychainService.saveRefreshToken(response.refreshToken)
            keychainService.saveUserId(response.user.id)
            keychainService.saveUserEmail(response.user.email)
            
            currentUser = response.user
            isAuthenticated = true
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    // MARK: - Apple Sign-In
    
    @MainActor
    func signInWithApple(result: Result<ASAuthorization, Error>) async throws {
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        switch result {
        case .success(let authorization):
            guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential,
                  let identityToken = appleIDCredential.identityToken,
                  let authorizationCode = appleIDCredential.authorizationCode,
                  let identityTokenString = String(data: identityToken, encoding: .utf8),
                  let authCodeString = String(data: authorizationCode, encoding: .utf8) else {
                throw AuthError.invalidAppleCredentials
            }
            
            let request = AppleSignInRequest(
                identityToken: identityTokenString,
                authorizationCode: authCodeString,
                email: appleIDCredential.email,
                firstName: appleIDCredential.fullName?.givenName,
                lastName: appleIDCredential.fullName?.familyName
            )
            
            do {
                let response: AuthResponse = try await apiService.request(
                    endpoint: .appleSignIn,
                    method: .post,
                    parameters: request.asDictionary(),
                    responseType: AuthResponse.self
                )
                
                // Save tokens and user info
                keychainService.saveAccessToken(response.accessToken)
                keychainService.saveRefreshToken(response.refreshToken)
                keychainService.saveUserId(response.user.id)
                keychainService.saveUserEmail(response.user.email)
                
                currentUser = response.user
                isAuthenticated = true
                
            } catch {
                errorMessage = error.localizedDescription
                throw error
            }
            
        case .failure(let error):
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    // MARK: - Google Sign-In
    
    @MainActor
    func signInWithGoogle() async throws {
        guard let presentingViewController = UIApplication.shared.windows.first?.rootViewController else {
            throw AuthError.noViewController
        }
        
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        return try await withCheckedThrowingContinuation { continuation in
            GIDSignIn.sharedInstance.signIn(withPresenting: presentingViewController) { result, error in
                if let error = error {
                    continuation.resume(throwing: error)
                    return
                }
                
                guard let result = result,
                      let idToken = result.user.idToken?.tokenString else {
                    continuation.resume(throwing: AuthError.invalidGoogleCredentials)
                    return
                }
                
                let accessToken = result.user.accessToken.tokenString
                
                Task {
                    do {
                        let request = GoogleSignInRequest(
                            idToken: idToken,
                            accessToken: accessToken
                        )
                        
                        let response: AuthResponse = try await self.apiService.request(
                            endpoint: .googleSignIn,
                            method: .post,
                            parameters: request.asDictionary(),
                            responseType: AuthResponse.self
                        )
                        
                        await MainActor.run {
                            // Save tokens and user info
                            self.keychainService.saveAccessToken(response.accessToken)
                            self.keychainService.saveRefreshToken(response.refreshToken)
                            self.keychainService.saveUserId(response.user.id)
                            self.keychainService.saveUserEmail(response.user.email)
                            
                            self.currentUser = response.user
                            self.isAuthenticated = true
                        }
                        
                        continuation.resume()
                        
                    } catch {
                        await MainActor.run {
                            self.errorMessage = error.localizedDescription
                        }
                        continuation.resume(throwing: error)
                    }
                }
            }
        }
    }
    
    // MARK: - Biometric Authentication
    
    @MainActor
    func authenticateWithBiometrics() async throws {
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        do {
            let success = try await keychainService.authenticateWithBiometrics()
            
            if success {
                // Get saved credentials
                if let savedPassword = try await keychainService.getBiometricPassword(),
                   let email = keychainService.getUserEmail() {
                    try await login(email: email, password: savedPassword)
                } else {
                    throw AuthError.noBiometricCredentials
                }
            }
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func enableBiometricAuthentication(password: String) async throws {
        do {
            try await keychainService.saveBiometricPassword(password)
            keychainService.setBiometricEnabled(true)
        } catch {
            throw error
        }
    }
    
    func disableBiometricAuthentication() {
        keychainService.removeBiometricPassword()
        keychainService.setBiometricEnabled(false)
    }
    
    // MARK: - Token Management
    
    func refreshToken(_ refreshToken: String) async throws -> AuthResponse {
        let request = RefreshTokenRequest(refreshToken: refreshToken)
        
        return try await apiService.request(
            endpoint: .refreshToken,
            method: .post,
            parameters: request.asDictionary(),
            responseType: AuthResponse.self
        )
    }
    
    // MARK: - Password Reset
    
    func forgotPassword(email: String) async throws {
        let parameters = ["email": email]
        
        let _: EmptyResponse = try await apiService.request(
            endpoint: .forgotPassword,
            method: .post,
            parameters: parameters,
            responseType: EmptyResponse.self
        )
    }
    
    func resetPassword(token: String, newPassword: String) async throws {
        let parameters = [
            "token": token,
            "password": newPassword
        ]
        
        let _: EmptyResponse = try await apiService.request(
            endpoint: .resetPassword,
            method: .post,
            parameters: parameters,
            responseType: EmptyResponse.self
        )
    }
    
    // MARK: - Logout
    
    @MainActor
    func logout() {
        Task {
            // Call logout endpoint to invalidate server-side token
            do {
                let _: EmptyResponse = try await apiService.request(
                    endpoint: .logout,
                    method: .post,
                    responseType: EmptyResponse.self
                )
            } catch {
                print("❌ Logout API call failed: \(error)")
            }
            
            await MainActor.run {
                // Clear local data
                keychainService.clearAllData()
                
                // Sign out from Google
                GIDSignIn.sharedInstance.signOut()
                
                // Reset state
                currentUser = nil
                isAuthenticated = false
                errorMessage = nil
            }
        }
    }
}

// MARK: - Authentication Errors

enum AuthError: LocalizedError {
    case invalidCredentials
    case invalidAppleCredentials
    case invalidGoogleCredentials
    case noViewController
    case noBiometricCredentials
    case networkError
    case serverError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password"
        case .invalidAppleCredentials:
            return "Invalid Apple Sign-In credentials"
        case .invalidGoogleCredentials:
            return "Invalid Google Sign-In credentials"
        case .noViewController:
            return "Unable to present sign-in interface"
        case .noBiometricCredentials:
            return "No biometric credentials found"
        case .networkError:
            return "Network connection error"
        case .serverError(let message):
            return message
        }
    }
}

// MARK: - Helper Models

struct EmptyResponse: Codable {}

// MARK: - Codable Extensions

extension Encodable {
    func asDictionary() -> [String: Any] {
        guard let data = try? JSONEncoder().encode(self),
              let dictionary = try? JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String: Any] else {
            return [:]
        }
        return dictionary
    }
}