'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { LoginSchema, type LoginRequest } from '@viport/types'
import { Button, Input, Label, Checkbox, LoadingButton, ApiError } from '@viport/ui'

import { useAuth } from '@/providers/auth-provider'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  const onSubmit = async (data: LoginRequest) => {
    try {
      setApiError(null)
      await login(data.email, data.password, data.rememberMe)
    } catch (error: any) {
      setApiError(error.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <ApiError 
            error={apiError} 
            onRetry={() => setApiError(null)}
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me
            </Label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80"
          >
            Forgot password?
          </Link>
        </div>

        <LoadingButton
          type="submit"
          className="w-full"
          loading={isSubmitting}
          loadingText="Signing in..."
        >
          Sign in
        </LoadingButton>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href={`/register${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Demo Credentials for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-sm font-medium mb-2">Demo Credentials</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Email: demo@viport.com</p>
            <p>Password: DemoPassword123!</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              setValue('email', 'demo@viport.com')
              setValue('password', 'DemoPassword123!')
            }}
          >
            Fill Demo Credentials
          </Button>
        </div>
      )}
    </div>
  )
}