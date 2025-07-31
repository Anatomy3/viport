'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'

import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GuestOnly } from '@/components/auth/protected-route'
import { ApiError } from '@/components/ui/error'
import { cn } from '@/lib/utils'

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, lowercase letter, number, and special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Contains number', valid: /\d/.test(password) },
    { label: 'Contains special character', valid: /[@$!%*?&]/.test(password) },
  ]
  
  const validCount = checks.filter(check => check.valid).length
  const strength = validCount / checks.length
  
  return { checks, strength }
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')
  const { checks: passwordChecks, strength: passwordStrength } = checkPasswordStrength(password || '')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setApiError(null)
      await registerUser({
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      })
      
      // Redirect will be handled by the auth provider
    } catch (error: any) {
      setApiError(error.message || 'Registration failed')
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 0.3) return 'bg-destructive'
    if (passwordStrength < 0.6) return 'bg-yellow-500'
    if (passwordStrength < 0.8) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 0.3) return 'Weak'
    if (passwordStrength < 0.6) return 'Fair'
    if (passwordStrength < 0.8) return 'Good'
    return 'Strong'
  }

  return (
    <GuestOnly>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Join Viport and start building your portfolio
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <ApiError 
                error={apiError} 
                onRetry={() => setApiError(null)}
              />
            )}

            <div className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    className="mt-1"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    className="mt-1"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  className="mt-1"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="johndoe"
                  className="mt-1"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Password strength: {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className={cn(
                          'h-1 rounded-full transition-all duration-300',
                          getPasswordStrengthColor()
                        )}
                        style={{ width: `${passwordStrength * 100}%` }}
                      />
                    </div>
                    <div className="space-y-1">
                      {passwordChecks.map((check, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {check.valid ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className={cn(
                            'text-xs',
                            check.valid ? 'text-green-600' : 'text-muted-foreground'
                          )}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className="pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href={`/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </GuestOnly>
  )
}