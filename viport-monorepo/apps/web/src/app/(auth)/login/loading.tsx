import { Card, CardContent, CardHeader } from '@viport/ui/components/ui/card';
import { Separator } from '@viport/ui/components/ui/separator';
import { Skeleton } from '@viport/ui/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      
      {/* Loading Form Container */}
      <div className="relative z-10 mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        {/* Logo and Header Skeleton */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">V</span>
          </div>
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>

        {/* Login Card Skeleton */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <Skeleton className="mx-auto h-6 w-24" />
            <Skeleton className="mx-auto h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Button Skeleton */}
            <Skeleton className="h-10 w-full" />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Form Fields Skeleton */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Footer Links Skeleton */}
        <Skeleton className="mx-auto h-4 w-48" />
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}