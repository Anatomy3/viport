'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  Plus
} from 'lucide-react'
import { 
  Button, 
  Input, 
  Avatar, 
  AvatarImage, 
  AvatarFallback,
} from '@viport/ui'

import { useAuth } from '@/providers/auth-provider'

export function DashboardHeader() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary" />
              <span className="font-bold text-xl hidden sm:block">Viport</span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search creators, posts, products..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Right side - Actions and profile */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-xs"></span>
            </Button>

            {/* Profile Menu */}
            <div className="relative group">
              <Button variant="ghost" className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium">
                  {user?.firstName || user?.username}
                </span>
              </Button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <Link 
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link 
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <hr className="my-2" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent w-full text-left text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}