import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @StateObject private var authService = AuthService.shared
    @State private var email = ""
    @State private var password = ""
    @State private var showingPassword = false
    @State private var rememberMe = false
    @State private var showingForgotPassword = false
    @State private var showingRegister = false
    @State private var showingBiometricLogin = false
    
    // Animation states
    @State private var logoScale: CGFloat = 0.8
    @State private var formOffset: CGFloat = 50
    @State private var isKeyboardVisible = false
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 0) {
                    // Header Section
                    headerSection
                        .frame(height: geometry.size.height * 0.4)
                    
                    // Form Section
                    formSection
                        .padding(.horizontal, 24)
                        .offset(y: formOffset)
                        .opacity(formOffset == 0 ? 1 : 0)
                }
            }
            .ignoresSafeArea(edges: .top)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color("PrimaryColor"),
                        Color("SecondaryColor")
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
            )
        }
        .onAppear {
            animateContent()
            checkBiometricAvailability()
        }
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)) { _ in
            withAnimation(.easeInOut(duration: 0.3)) {
                isKeyboardVisible = true
            }
        }
        .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)) { _ in
            withAnimation(.easeInOut(duration: 0.3)) {
                isKeyboardVisible = false
            }
        }
        .alert("Error", isPresented: .constant(authService.errorMessage != nil)) {
            Button("OK") {
                authService.errorMessage = nil
            }
        } message: {
            Text(authService.errorMessage ?? "")
        }
        .sheet(isPresented: $showingForgotPassword) {
            ForgotPasswordView()
        }
        .sheet(isPresented: $showingRegister) {
            RegisterView()
        }
    }
    
    // MARK: - Header Section
    
    private var headerSection: some View {
        VStack(spacing: 20) {
            Spacer()
            
            // Logo
            Image("AppLogo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 100, height: 100)
                .scaleEffect(logoScale)
                .foregroundColor(.white)
            
            // Welcome text
            VStack(spacing: 8) {
                Text("Welcome Back")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("Sign in to continue your journey")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
            }
            
            Spacer()
        }
    }
    
    // MARK: - Form Section
    
    private var formSection: some View {
        VStack(spacing: 24) {
            // Login Form Card
            VStack(spacing: 20) {
                // Email Field
                CustomTextField(
                    title: "Email",
                    text: $email,
                    placeholder: "Enter your email",
                    keyboardType: .emailAddress,
                    icon: "envelope"
                )
                
                // Password Field
                CustomSecureField(
                    title: "Password",
                    text: $password,
                    placeholder: "Enter your password",
                    showPassword: $showingPassword,
                    icon: "lock"
                )
                
                // Remember Me & Forgot Password
                HStack {
                    HStack(spacing: 8) {
                        Button {
                            rememberMe.toggle()
                        } label: {
                            Image(systemName: rememberMe ? "checkmark.square.fill" : "square")
                                .foregroundColor(rememberMe ? Color("PrimaryColor") : .gray)
                                .font(.system(size: 18))
                        }
                        
                        Text("Remember me")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.primary)
                    }
                    
                    Spacer()
                    
                    Button {
                        showingForgotPassword = true
                    } label: {
                        Text("Forgot Password?")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(Color("PrimaryColor"))
                    }
                }
                
                // Login Button
                Button {
                    Task {
                        await performLogin()
                    }
                } label: {
                    HStack {
                        if authService.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Text("Sign In")
                                .font(.system(size: 16, weight: .semibold))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color("PrimaryColor"))
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(authService.isLoading || !isFormValid)
                .opacity(isFormValid ? 1.0 : 0.6)
                
                // Biometric Login Button
                if showingBiometricLogin {
                    biometricLoginButton
                }
            }
            .padding(24)
            .background(Color(.systemBackground))
            .cornerRadius(20)
            .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
            
            // Divider
            HStack {
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.gray.opacity(0.3))
                
                Text("OR")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.gray)
                    .padding(.horizontal, 16)
                
                Rectangle()
                    .frame(height: 1)
                    .foregroundColor(.gray.opacity(0.3))
            }
            
            // Social Login Buttons
            socialLoginButtons
            
            // Register Link
            HStack {
                Text("Don't have an account?")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.8))
                
                Button {
                    showingRegister = true
                } label: {
                    Text("Sign Up")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            .padding(.top, 20)
            
            Spacer(minLength: 50)
        }
    }
    
    // MARK: - Biometric Login Button
    
    private var biometricLoginButton: some View {
        Button {
            Task {
                await performBiometricLogin()
            }
        } label: {
            HStack(spacing: 12) {
                Image(systemName: biometricIconName)
                    .font(.system(size: 18))
                
                Text("Sign in with \(biometricTypeName)")
                    .font(.system(size: 16, weight: .medium))
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color(.systemGray6))
            .foregroundColor(Color("PrimaryColor"))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color("PrimaryColor"), lineWidth: 1)
            )
        }
        .disabled(authService.isLoading)
    }
    
    // MARK: - Social Login Buttons
    
    private var socialLoginButtons: some View {
        VStack(spacing: 12) {
            // Apple Sign In
            SignInWithAppleButton(
                onRequest: { request in
                    request.requestedScopes = [.fullName, .email]
                },
                onCompletion: { result in
                    Task {
                        do {
                            try await authService.signInWithApple(result: result)
                        } catch {
                            print("❌ Apple Sign-In failed: \(error)")
                        }
                    }
                }
            )
            .signInWithAppleButtonStyle(.white)
            .frame(height: 50)
            .cornerRadius(12)
            
            // Google Sign In
            Button {
                Task {
                    await performGoogleSignIn()
                }
            } label: {
                HStack(spacing: 12) {
                    Image("GoogleLogo")
                        .resizable()
                        .frame(width: 20, height: 20)
                    
                    Text("Continue with Google")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.black)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.white)
                .cornerRadius(12)
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
            }
            .disabled(authService.isLoading)
        }
    }
    
    // MARK: - Computed Properties
    
    private var isFormValid: Bool {
        !email.isEmpty && !password.isEmpty && email.contains("@")
    }
    
    private var biometricIconName: String {
        let (_, biometricType) = KeychainService.shared.canUseBiometrics()
        return biometricType.iconName
    }
    
    private var biometricTypeName: String {
        let (_, biometricType) = KeychainService.shared.canUseBiometrics()
        return biometricType.displayName
    }
    
    // MARK: - Methods
    
    private func animateContent() {
        withAnimation(.spring(response: 1.0, dampingFraction: 0.6)) {
            logoScale = 1.0
        }
        
        withAnimation(.easeOut(duration: 0.8).delay(0.3)) {
            formOffset = 0
        }
    }
    
    private func checkBiometricAvailability() {
        let (canUseBiometrics, _) = KeychainService.shared.canUseBiometrics()
        let isBiometricEnabled = KeychainService.shared.isBiometricEnabled()
        
        showingBiometricLogin = canUseBiometrics && isBiometricEnabled
    }
    
    private func performLogin() async {
        do {
            try await authService.login(email: email, password: password)
            
            if rememberMe {
                try await authService.enableBiometricAuthentication(password: password)
            }
        } catch {
            print("❌ Login failed: \(error)")
        }
    }
    
    private func performBiometricLogin() async {
        do {
            try await authService.authenticateWithBiometrics()
        } catch {
            print("❌ Biometric login failed: \(error)")
        }
    }
    
    private func performGoogleSignIn() async {
        do {
            try await authService.signInWithGoogle()
        } catch {
            print("❌ Google Sign-In failed: \(error)")
        }
    }
}

// MARK: - Custom Text Fields

struct CustomTextField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    var keyboardType: UIKeyboardType = .default
    let icon: String
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(isFocused ? Color("PrimaryColor") : .gray)
                    .font(.system(size: 16))
                    .frame(width: 20)
                
                TextField(placeholder, text: $text)
                    .keyboardType(keyboardType)
                    .autocapitalization(.none)
                    .disableAutocorrection(true)
                    .focused($isFocused)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color(.systemGray6))
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isFocused ? Color("PrimaryColor") : Color.clear, lineWidth: 2)
            )
        }
    }
}

struct CustomSecureField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    @Binding var showPassword: Bool
    let icon: String
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundColor(isFocused ? Color("PrimaryColor") : .gray)
                    .font(.system(size: 16))
                    .frame(width: 20)
                
                if showPassword {
                    TextField(placeholder, text: $text)
                        .focused($isFocused)
                } else {
                    SecureField(placeholder, text: $text)
                        .focused($isFocused)
                }
                
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(.gray)
                        .font(.system(size: 16))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color(.systemGray6))
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isFocused ? Color("PrimaryColor") : Color.clear, lineWidth: 2)
            )
        }
    }
}

#Preview {
    LoginView()
}