import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Server-side authentication check for the entire auth group
  const session = await getServerSession();
  
  // Redirect authenticated users away from auth pages
  if (session) {
    redirect('/beranda');
  }

  return (
    <div className="auth-layout">
      {/* Optional: Add auth-specific navigation or branding */}
      {children}
    </div>
  );
}