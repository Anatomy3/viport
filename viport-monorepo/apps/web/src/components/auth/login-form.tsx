'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@viport/ui/components/ui/button';
import { Input } from '@viport/ui/components/ui/input';
import { Label } from '@viport/ui/components/ui/label';
import { Checkbox } from '@viport/ui/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@viport/ui/components/ui/form';
import { useToast } from '@viport/ui/hooks/use-toast';
import { trpc } from '@/lib/trpc';

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // tRPC mutation for login
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Welcome back!',
        description: 'You have been successfully signed in.',
      });
      
      // Store auth token (you might want to use a more secure method)
      localStorage.setItem('auth_token', data.data.token);
      
      // Redirect to dashboard
      router.push('/beranda');
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    },
  });

  // React Hook Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Form submission handler
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Login error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    autoComplete="email"
                    disabled={loginMutation.isLoading}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    disabled={loginMutation.isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loginMutation.isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loginMutation.isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Remember me
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button
            variant="link"
            size="sm"
            className="px-0 font-normal"
            asChild
          >
            <a href="/forgot-password">
              Forgot password?
            </a>
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isLoading}
        >
          {loginMutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </Form>
  );
}