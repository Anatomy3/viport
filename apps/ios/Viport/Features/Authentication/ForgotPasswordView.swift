import SwiftUI

struct ForgotPasswordView: View {
    @StateObject private var authService = AuthService.shared
    @Environment(\.dismiss) private var dismiss
    
    @State private var email = ""
    @State private var showingSuccess = false
    @State private var isEmailSent = false
    
    // Animation states
    @State private var contentOffset: CGFloat = 30
    @State private var contentOpacity: Double = 0
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    headerSection
                        .offset(y: contentOffset)
                        .opacity(contentOpacity)
                    
                    // Content
                    if isEmailSent {
                        successContent
                    } else {
                        formContent
                    }
                    
                    Spacer(minLength: 100)
                }
                .padding(.horizontal, 24)
                .padding(.top, 40)
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Color("PrimaryColor"))
                }
                
                ToolbarItem(placement: .principal) {
                    Text("Reset Password")
                        .font(.system(size: 18, weight: .semibold))
                }
            }
        }
        .onAppear {
            animateContent()
        }
        .alert("Success", isPresented: $showingSuccess) {
            Button("OK") {
                showingSuccess = false
            }
        } message: {
            Text("Password reset instructions have been sent to your email.")
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
        VStack(spacing: 20) {
            // Icon
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
                .frame(width: 80, height: 80)
                .overlay(
                    Image(systemName: isEmailSent ? "checkmark" : "key.fill")
                        .font(.system(size: 32, weight: .medium))
                        .foregroundColor(.white)
                )
            
            // Title and description
            VStack(spacing: 12) {
                Text(isEmailSent ? "Check Your Email" : "Forgot Password?")
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                
                Text(isEmailSent ? 
                     "We've sent password reset instructions to your email address." :
                     "Don't worry! Enter your email address and we'll send you instructions to reset your password."
                )
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .lineLimit(nil)
            }
        }
    }
    
    // MARK: - Form Content
    
    private var formContent: some View {
        VStack(spacing: 24) {
            // Email input card
            VStack(spacing: 20) {
                Text("Enter Your Email")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.primary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                CustomTextField(
                    title: "Email Address",
                    text: $email,
                    placeholder: "Enter your email address",
                    keyboardType: .emailAddress,
                    icon: "envelope"
                )
                
                // Send button
                Button {
                    Task {
                        await sendResetEmail()
                    }
                } label: {
                    HStack {
                        if authService.isLoading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Text("Send Reset Instructions")
                                .font(.system(size: 16, weight: .semibold))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(isValidEmail ? Color("PrimaryColor") : Color.gray)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(!isValidEmail || authService.isLoading)
            }
            .padding(24)
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 5)
            .offset(y: contentOffset)
            .opacity(contentOpacity)
            
            // Back to login
            backToLoginButton
                .offset(y: contentOffset)
                .opacity(contentOpacity * 0.8)
        }
    }
    
    // MARK: - Success Content
    
    private var successContent: some View {
        VStack(spacing: 24) {
            // Success card
            VStack(spacing: 20) {
                VStack(spacing: 16) {
                    Text("Email Sent Successfully!")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    Text("We've sent password reset instructions to:")
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                    
                    Text(email)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(Color("PrimaryColor"))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color("PrimaryColor").opacity(0.1))
                        .cornerRadius(8)
                }
                
                VStack(spacing: 12) {
                    Text("What's next?")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primary)
                    
                    VStack(alignment: .leading, spacing: 8) {
                        HStack(alignment: .top, spacing: 12) {
                            Text("1.")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color("PrimaryColor"))
                            
                            Text("Check your email inbox (and spam folder)")
                                .font(.system(size: 14))
                                .foregroundColor(.secondary)
                        }
                        
                        HStack(alignment: .top, spacing: 12) {
                            Text("2.")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color("PrimaryColor"))
                            
                            Text("Click the reset link in the email")
                                .font(.system(size: 14))
                                .foregroundColor(.secondary)
                        }
                        
                        HStack(alignment: .top, spacing: 12) {
                            Text("3.")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(Color("PrimaryColor"))
                            
                            Text("Create a new password")
                                .font(.system(size: 14))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                // Resend button
                VStack(spacing: 12) {
                    Text("Didn't receive the email?")
                        .font(.system(size: 14))
                        .foregroundColor(.secondary)
                    
                    Button {
                        Task {
                            await sendResetEmail()
                        }
                    } label: {
                        Text("Resend Email")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(Color("PrimaryColor"))
                    }
                    .disabled(authService.isLoading)
                }
            }
            .padding(24)
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.05), radius: 10, x: 0, y: 5)
            
            // Back to login
            backToLoginButton
        }
        .transition(.opacity.combined(with: .scale(scale: 0.95)))
    }
    
    // MARK: - Back to Login Button
    
    private var backToLoginButton: some View {
        Button {
            dismiss()
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "arrow.left")
                    .font(.system(size: 14, weight: .medium))
                
                Text("Back to Login")
                    .font(.system(size: 16, weight: .medium))
            }
            .foregroundColor(Color("PrimaryColor"))
        }
    }
    
    // MARK: - Computed Properties
    
    private var isValidEmail: Bool {
        !email.isEmpty && email.contains("@") && email.contains(".")
    }
    
    // MARK: - Methods
    
    private func animateContent() {
        withAnimation(.easeOut(duration: 0.6)) {
            contentOffset = 0
            contentOpacity = 1
        }
    }
    
    private func sendResetEmail() async {
        do {
            try await authService.forgotPassword(email: email)
            
            withAnimation(.easeInOut(duration: 0.5)) {
                isEmailSent = true
            }
            
        } catch {
            print("❌ Failed to send reset email: \(error)")
        }
    }
}

#Preview {
    ForgotPasswordView()
}