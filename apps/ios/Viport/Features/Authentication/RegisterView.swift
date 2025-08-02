import SwiftUI
import AuthenticationServices

struct RegisterView: View {
    @StateObject private var authService = AuthService.shared
    @Environment(\.dismiss) private var dismiss
    
    // Form fields
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var username = ""
    @State private var displayName = ""
    @State private var firstName = ""
    @State private var lastName = ""
    
    // UI states
    @State private var showingPassword = false
    @State private var showingConfirmPassword = false
    @State private var agreedToTerms = false
    @State private var currentStep = 1
    
    // Animation states
    @State private var headerOffset: CGFloat = -50
    @State private var formOpacity: Double = 0
    
    private let totalSteps = 2
    
    var body: some View {
        NavigationView {
            GeometryReader { geometry in
                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        headerSection
                            .offset(y: headerOffset)
                            .opacity(headerOffset == 0 ? 1 : 0)
                        
                        // Progress Indicator
                        progressIndicator
                        
                        // Form Content
                        VStack(spacing: 24) {
                            if currentStep == 1 {
                                step1Content
                            } else {
                                step2Content
                            }
                            
                            // Navigation Buttons
                            navigationButtons
                        }
                        .padding(.horizontal, 24)
                        .opacity(formOpacity)
                        
                        // Social Registration
                        if currentStep == 1 {
                            socialRegistrationSection
                                .opacity(formOpacity)
                        }
                        
                        Spacer(minLength: 50)
                    }
                    .padding(.top, 20)
                }
            }
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [
                        Color("PrimaryColor").opacity(0.1),
                        Color("SecondaryColor").opacity(0.1)
                    ]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
            )
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Color("PrimaryColor"))
                }
                
                ToolbarItem(placement: .principal) {
                    Text("Create Account")
                        .font(.system(size: 18, weight: .semibold))
                }
            }
        }
        .onAppear {
            animateContent()
        }
        .alert("Error", isPresented: .constant(authService.errorMessage != nil)) {
            Button("OK") {
                authService.errorMessage = nil
            }
        } message: {
            Text(authService.errorMessage ?? "")
        }
    }
    
    // MARK: - Header Section
    
    private var headerSection: some View {
        VStack(spacing: 16) {
            Image("AppLogo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 80, height: 80)
                .foregroundColor(Color("PrimaryColor"))
            
            VStack(spacing: 8) {
                Text("Join Viport")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Text("Connect with creators and build your community")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
    }
    
    // MARK: - Progress Indicator
    
    private var progressIndicator: some View {
        VStack(spacing: 12) {
            HStack(spacing: 0) {
                ForEach(1...totalSteps, id: \.self) { step in
                    Rectangle()
                        .fill(step <= currentStep ? Color("PrimaryColor") : Color.gray.opacity(0.3))
                        .frame(height: 4)
                        .animation(.easeInOut(duration: 0.3), value: currentStep)
                    
                    if step < totalSteps {
                        Rectangle()
                            .fill(Color.clear)
                            .frame(width: 8, height: 4)
                    }
                }
            }
            .cornerRadius(2)
            
            Text("Step \(currentStep) of \(totalSteps)")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 24)
    }
    
    // MARK: - Step 1 Content
    
    private var step1Content: some View {
        VStack(spacing: 20) {
            Text("Account Information")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Email Field
            CustomTextField(
                title: "Email Address",
                text: $email,
                placeholder: "Enter your email",
                keyboardType: .emailAddress,
                icon: "envelope"
            )
            
            // Username Field
            CustomTextField(
                title: "Username",
                text: $username,
                placeholder: "Choose a username",
                icon: "at"
            )
            
            // Password Field
            CustomSecureField(
                title: "Password",
                text: $password,
                placeholder: "Create a password",
                showPassword: $showingPassword,
                icon: "lock"
            )
            
            // Confirm Password Field
            CustomSecureField(
                title: "Confirm Password",
                text: $confirmPassword,
                placeholder: "Confirm your password",
                showPassword: $showingConfirmPassword,
                icon: "lock.fill"
            )
            
            // Password Requirements
            passwordRequirements
        }
        .padding(24)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 5)
    }
    
    // MARK: - Step 2 Content
    
    private var step2Content: some View {
        VStack(spacing: 20) {
            Text("Personal Information")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Display Name Field
            CustomTextField(
                title: "Display Name",
                text: $displayName,
                placeholder: "How should we call you?",
                icon: "person"
            )
            
            // First Name Field
            CustomTextField(
                title: "First Name (Optional)",
                text: $firstName,
                placeholder: "Enter your first name",
                icon: "person.circle"
            )
            
            // Last Name Field
            CustomTextField(
                title: "Last Name (Optional)",
                text: $lastName,
                placeholder: "Enter your last name",
                icon: "person.circle.fill"
            )
            
            // Terms and Conditions
            termsAndConditions
        }
        .padding(24)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 5)
    }
    
    // MARK: - Password Requirements
    
    private var passwordRequirements: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Password must contain:")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.secondary)
            
            HStack(spacing: 8) {
                Image(systemName: password.count >= 8 ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(password.count >= 8 ? .green : .gray)
                    .font(.system(size: 12))
                
                Text("At least 8 characters")
                    .font(.system(size: 12))
                    .foregroundColor(password.count >= 8 ? .green : .gray)
            }
            
            HStack(spacing: 8) {
                Image(systemName: containsUppercase ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(containsUppercase ? .green : .gray)
                    .font(.system(size: 12))
                
                Text("One uppercase letter")
                    .font(.system(size: 12))
                    .foregroundColor(containsUppercase ? .green : .gray)
            }
            
            HStack(spacing: 8) {
                Image(systemName: containsNumber ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(containsNumber ? .green : .gray)
                    .font(.system(size: 12))
                
                Text("One number")
                    .font(.system(size: 12))
                    .foregroundColor(containsNumber ? .green : .gray)
            }
            
            HStack(spacing: 8) {
                Image(systemName: passwordsMatch ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(passwordsMatch ? .green : .gray)
                    .font(.system(size: 12))
                
                Text("Passwords match")
                    .font(.system(size: 12))
                    .foregroundColor(passwordsMatch ? .green : .gray)
            }
        }
    }
    
    // MARK: - Terms and Conditions
    
    private var termsAndConditions: some View {
        HStack(alignment: .top, spacing: 12) {
            Button {
                agreedToTerms.toggle()
            } label: {
                Image(systemName: agreedToTerms ? "checkmark.square.fill" : "square")
                    .foregroundColor(agreedToTerms ? Color("PrimaryColor") : .gray)
                    .font(.system(size: 20))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("I agree to the Terms of Service and Privacy Policy")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.primary)
                
                HStack(spacing: 16) {
                    Button("Terms of Service") {
                        // Handle terms tap
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(Color("PrimaryColor"))
                    
                    Button("Privacy Policy") {
                        // Handle privacy policy tap
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(Color("PrimaryColor"))
                }
            }
            
            Spacer()
        }
    }
    
    // MARK: - Navigation Buttons
    
    private var navigationButtons: some View {
        HStack(spacing: 16) {
            if currentStep > 1 {
                Button {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        currentStep -= 1
                    }
                } label: {
                    Text("Back")
                        .font(.system(size: 16, weight: .semibold))
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color(.systemGray6))
                        .foregroundColor(Color("PrimaryColor"))
                        .cornerRadius(12)
                }
            }
            
            Button {
                if currentStep < totalSteps {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        currentStep += 1
                    }
                } else {
                    Task {
                        await performRegistration()
                    }
                }
            } label: {
                HStack {
                    if authService.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.8)
                    } else {
                        Text(currentStep < totalSteps ? "Next" : "Create Account")
                            .font(.system(size: 16, weight: .semibold))
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(isCurrentStepValid ? Color("PrimaryColor") : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(!isCurrentStepValid || authService.isLoading)
        }
    }
    
    // MARK: - Social Registration Section
    
    private var socialRegistrationSection: some View {
        VStack(spacing: 16) {
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
            .padding(.horizontal, 24)
            
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
                                dismiss()
                            } catch {
                                print("❌ Apple Sign-In failed: \(error)")
                            }
                        }
                    }
                )
                .signInWithAppleButtonStyle(.black)
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
            .padding(.horizontal, 24)
        }
    }
    
    // MARK: - Computed Properties
    
    private var containsUppercase: Bool {
        password.rangeOfCharacter(from: .uppercaseLetters) != nil
    }
    
    private var containsNumber: Bool {
        password.rangeOfCharacter(from: .decimalDigits) != nil
    }
    
    private var passwordsMatch: Bool {
        password == confirmPassword && !password.isEmpty
    }
    
    private var isPasswordValid: Bool {
        password.count >= 8 && containsUppercase && containsNumber && passwordsMatch
    }
    
    private var isStep1Valid: Bool {
        !email.isEmpty && email.contains("@") && !username.isEmpty && isPasswordValid
    }
    
    private var isStep2Valid: Bool {
        !displayName.isEmpty && agreedToTerms
    }
    
    private var isCurrentStepValid: Bool {
        switch currentStep {
        case 1:
            return isStep1Valid
        case 2:
            return isStep2Valid
        default:
            return false
        }
    }
    
    // MARK: - Methods
    
    private func animateContent() {
        withAnimation(.easeOut(duration: 0.6)) {
            headerOffset = 0
        }
        
        withAnimation(.easeOut(duration: 0.8).delay(0.2)) {
            formOpacity = 1
        }
    }
    
    private func performRegistration() async {
        do {
            try await authService.register(
                email: email,
                password: password,
                username: username,
                displayName: displayName,
                firstName: firstName.isEmpty ? nil : firstName,
                lastName: lastName.isEmpty ? nil : lastName
            )
            dismiss()
        } catch {
            print("❌ Registration failed: \(error)")
        }
    }
    
    private func performGoogleSignIn() async {
        do {
            try await authService.signInWithGoogle()
            dismiss()
        } catch {
            print("❌ Google Sign-In failed: \(error)")
        }
    }
}

#Preview {
    RegisterView()
}