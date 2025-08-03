import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Posts', href: '/dashboard/posts' },
  { name: 'Profile', href: '/dashboard/profile' },
  { name: 'Portfolio', href: '/dashboard/portfolio' },
  { name: 'Shop', href: '/dashboard/shop' },
  { name: 'Messages', href: '/dashboard/messages' },
  { name: 'Analytics', href: '/dashboard/analytics' },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}