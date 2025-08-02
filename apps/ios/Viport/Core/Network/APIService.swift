import Foundation
import Alamofire
import SwiftyJSON

// MARK: - API Service

class APIService {
    static let shared = APIService()
    
    private let session: Session
    private let baseURL: String
    private let keychainService = KeychainService.shared
    
    // API Configuration
    private struct APIConfig {
        static let baseURL = "http://localhost:8080/api"  // Development URL
        static let timeout: TimeInterval = 30.0
        static let retryLimit = 3
    }
    
    private init() {
        // Configure URLSessionConfiguration
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = APIConfig.timeout
        configuration.timeoutIntervalForResource = APIConfig.timeout * 2
        configuration.requestCachePolicy = .useProtocolCachePolicy
        
        // Create custom session with interceptors
        session = Session(
            configuration: configuration,
            interceptor: APIInterceptor()
        )
        
        baseURL = APIConfig.baseURL
    }
    
    // MARK: - Generic Request Method
    
    func request<T: Codable>(
        endpoint: APIEndpoint,
        method: HTTPMethod = .get,
        parameters: Parameters? = nil,
        encoding: ParameterEncoding = JSONEncoding.default,
        headers: HTTPHeaders? = nil,
        responseType: T.Type
    ) async throws -> T {
        
        let url = baseURL + endpoint.path
        var requestHeaders = defaultHeaders()
        
        // Add custom headers
        if let headers = headers {
            for header in headers {
                requestHeaders.add(header)
            }
        }
        
        return try await withCheckedThrowingContinuation { continuation in
            session.request(
                url,
                method: method,
                parameters: parameters,
                encoding: encoding,
                headers: requestHeaders
            )
            .validate()
            .responseData { response in
                switch response.result {
                case .success(let data):
                    do {
                        let decoder = JSONDecoder()
                        decoder.dateDecodingStrategy = .iso8601
                        let result = try decoder.decode(T.self, from: data)
                        continuation.resume(returning: result)
                    } catch {
                        print("❌ Decoding error: \(error)")
                        print("❌ Response data: \(String(data: data, encoding: .utf8) ?? "nil")")
                        continuation.resume(throwing: APIError.decodingError(error))
                    }
                    
                case .failure(let error):
                    let apiError = self.handleAFError(error, data: response.data)
                    continuation.resume(throwing: apiError)
                }
            }
        }
    }
    
    // MARK: - Upload Request Method
    
    func upload<T: Codable>(
        endpoint: APIEndpoint,
        multipartFormData: @escaping (MultipartFormData) -> Void,
        responseType: T.Type
    ) async throws -> T {
        
        let url = baseURL + endpoint.path
        let headers = defaultHeaders()
        
        return try await withCheckedThrowingContinuation { continuation in
            session.upload(
                multipartFormData: multipartFormData,
                to: url,
                headers: headers
            )
            .validate()
            .responseData { response in
                switch response.result {
                case .success(let data):
                    do {
                        let decoder = JSONDecoder()
                        decoder.dateDecodingStrategy = .iso8601
                        let result = try decoder.decode(T.self, from: data)
                        continuation.resume(returning: result)
                    } catch {
                        continuation.resume(throwing: APIError.decodingError(error))
                    }
                    
                case .failure(let error):
                    let apiError = self.handleAFError(error, data: response.data)
                    continuation.resume(throwing: apiError)
                }
            }
        }
    }
    
    // MARK: - Private Methods
    
    private func defaultHeaders() -> HTTPHeaders {
        var headers: HTTPHeaders = [
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Viport iOS/1.0"
        ]
        
        // Add authorization header if token exists
        if let token = keychainService.getAccessToken() {
            headers.add(.authorization(bearerToken: token))
        }
        
        return headers
    }
    
    private func handleAFError(_ error: AFError, data: Data?) -> APIError {
        switch error {
        case .responseValidationFailed(let reason):
            switch reason {
            case .unacceptableStatusCode(let code):
                return handleHTTPError(statusCode: code, data: data)
            default:
                return .networkError(error)
            }
        case .sessionTaskFailed(let error):
            if let urlError = error as? URLError {
                switch urlError.code {
                case .notConnectedToInternet, .networkConnectionLost:
                    return .noInternetConnection
                case .timedOut:
                    return .timeout
                default:
                    return .networkError(error)
                }
            }
            return .networkError(error)
        default:
            return .networkError(error)
        }
    }
    
    private func handleHTTPError(statusCode: Int, data: Data?) -> APIError {
        switch statusCode {
        case 400:
            return parseErrorResponse(data: data, defaultError: .badRequest)
        case 401:
            // Clear stored token on unauthorized
            keychainService.clearAccessToken()
            return .unauthorized
        case 403:
            return .forbidden
        case 404:
            return .notFound
        case 422:
            return parseErrorResponse(data: data, defaultError: .validationError([]))
        case 429:
            return .rateLimited
        case 500...599:
            return .serverError(statusCode)
        default:
            return .unknown
        }
    }
    
    private func parseErrorResponse(data: Data?, defaultError: APIError) -> APIError {
        guard let data = data else { return defaultError }
        
        do {
            let json = try JSON(data: data)
            let message = json["message"].stringValue
            let errors = json["errors"].arrayValue.compactMap { $0.stringValue }
            
            if !message.isEmpty {
                return .serverMessage(message)
            }
            
            if !errors.isEmpty {
                return .validationError(errors)
            }
            
            return defaultError
        } catch {
            return defaultError
        }
    }
}

// MARK: - API Interceptor

class APIInterceptor: RequestInterceptor {
    private let keychainService = KeychainService.shared
    private let retryLimit = 3
    
    func adapt(_ urlRequest: URLRequest, for session: Session, completion: @escaping (Result<URLRequest, Error>) -> Void) {
        var adaptedRequest = urlRequest
        
        // Add authorization header if token exists
        if let token = keychainService.getAccessToken() {
            adaptedRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        completion(.success(adaptedRequest))
    }
    
    func retry(_ request: Request, for session: Session, dueTo error: Error, completion: @escaping (RetryResult) -> Void) {
        guard request.retryCount < retryLimit else {
            completion(.doNotRetry)
            return
        }
        
        // Retry on network errors
        if let afError = error as? AFError {
            switch afError {
            case .sessionTaskFailed(let sessionError):
                if let urlError = sessionError as? URLError {
                    switch urlError.code {
                    case .timedOut, .networkConnectionLost, .notConnectedToInternet:
                        // Retry with exponential backoff
                        let delay = pow(2.0, Double(request.retryCount))
                        completion(.retryWithDelay(delay))
                        return
                    default:
                        break
                    }
                }
            case .responseValidationFailed(let reason):
                if case .unacceptableStatusCode(let code) = reason, code == 401 {
                    // Token might be expired, try to refresh
                    refreshTokenAndRetry(completion: completion)
                    return
                }
            default:
                break
            }
        }
        
        completion(.doNotRetry)
    }
    
    private func refreshTokenAndRetry(completion: @escaping (RetryResult) -> Void) {
        guard let refreshToken = keychainService.getRefreshToken() else {
            completion(.doNotRetry)
            return
        }
        
        Task {
            do {
                let response = try await AuthService.shared.refreshToken(refreshToken)
                keychainService.saveAccessToken(response.accessToken)
                keychainService.saveRefreshToken(response.refreshToken)
                completion(.retry)
            } catch {
                keychainService.clearTokens()
                completion(.doNotRetry)
            }
        }
    }
}

// MARK: - API Endpoints

enum APIEndpoint {
    // Authentication
    case login
    case register
    case appleSignIn
    case googleSignIn
    case refreshToken
    case logout
    case forgotPassword
    case resetPassword
    
    // User
    case profile(String)
    case updateProfile
    case uploadAvatar
    case followUser(String)
    case unfollowUser(String)
    case followers(String)
    case following(String)
    
    // Posts
    case posts
    case createPost
    case post(String)
    case updatePost(String)
    case deletePost(String)
    case likePost(String)
    case unlikePost(String)
    case postComments(String)
    case createComment(String)
    
    // Marketplace
    case products
    case createProduct
    case product(String)
    case updateProduct(String)
    case deleteProduct(String)
    case productCategories
    case searchProducts
    
    // Learning
    case courses
    case course(String)
    case enrollCourse(String)
    case courseProgress(String)
    case lessons(String)
    case lesson(String, String)
    
    // Chat
    case conversations
    case conversation(String)
    case sendMessage(String)
    case messages(String)
    
    // Media
    case uploadMedia
    case media(String)
    
    var path: String {
        switch self {
        // Authentication
        case .login: return "/auth/login"
        case .register: return "/auth/register"
        case .appleSignIn: return "/auth/apple"
        case .googleSignIn: return "/auth/google"
        case .refreshToken: return "/auth/refresh"
        case .logout: return "/auth/logout"
        case .forgotPassword: return "/auth/forgot-password"
        case .resetPassword: return "/auth/reset-password"
            
        // User
        case .profile(let id): return "/users/\(id)"
        case .updateProfile: return "/users/profile"
        case .uploadAvatar: return "/users/avatar"
        case .followUser(let id): return "/users/\(id)/follow"
        case .unfollowUser(let id): return "/users/\(id)/unfollow"
        case .followers(let id): return "/users/\(id)/followers"
        case .following(let id): return "/users/\(id)/following"
            
        // Posts
        case .posts: return "/posts"
        case .createPost: return "/posts"
        case .post(let id): return "/posts/\(id)"
        case .updatePost(let id): return "/posts/\(id)"
        case .deletePost(let id): return "/posts/\(id)"
        case .likePost(let id): return "/posts/\(id)/like"
        case .unlikePost(let id): return "/posts/\(id)/unlike"
        case .postComments(let id): return "/posts/\(id)/comments"
        case .createComment(let id): return "/posts/\(id)/comments"
            
        // Marketplace
        case .products: return "/products"
        case .createProduct: return "/products"
        case .product(let id): return "/products/\(id)"
        case .updateProduct(let id): return "/products/\(id)"
        case .deleteProduct(let id): return "/products/\(id)"
        case .productCategories: return "/products/categories"
        case .searchProducts: return "/products/search"
            
        // Learning
        case .courses: return "/courses"
        case .course(let id): return "/courses/\(id)"
        case .enrollCourse(let id): return "/courses/\(id)/enroll"
        case .courseProgress(let id): return "/courses/\(id)/progress"
        case .lessons(let courseId): return "/courses/\(courseId)/lessons"
        case .lesson(let courseId, let lessonId): return "/courses/\(courseId)/lessons/\(lessonId)"
            
        // Chat
        case .conversations: return "/chat/conversations"
        case .conversation(let id): return "/chat/conversations/\(id)"
        case .sendMessage(let id): return "/chat/conversations/\(id)/messages"
        case .messages(let id): return "/chat/conversations/\(id)/messages"
            
        // Media
        case .uploadMedia: return "/media/upload"
        case .media(let id): return "/media/\(id)"
        }
    }
}

// MARK: - API Errors

enum APIError: LocalizedError {
    case networkError(Error)
    case decodingError(Error)
    case noInternetConnection
    case timeout
    case unauthorized
    case forbidden
    case notFound
    case badRequest
    case validationError([String])
    case serverMessage(String)
    case serverError(Int)
    case rateLimited
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .decodingError:
            return "Failed to process response data"
        case .noInternetConnection:
            return "No internet connection available"
        case .timeout:
            return "Request timed out"
        case .unauthorized:
            return "Authentication required"
        case .forbidden:
            return "Access denied"
        case .notFound:
            return "Resource not found"
        case .badRequest:
            return "Invalid request"
        case .validationError(let errors):
            return errors.joined(separator: "\n")
        case .serverMessage(let message):
            return message
        case .serverError(let code):
            return "Server error (code: \(code))"
        case .rateLimited:
            return "Too many requests. Please try again later"
        case .unknown:
            return "An unexpected error occurred"
        }
    }
}