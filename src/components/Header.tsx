'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Menu, X, Plus, Settings, LogOut, User, LayoutDashboard } from 'lucide-react'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter } from 'next/navigation'

interface SiteSettings {
  ranking_enabled: boolean
}

export function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderInner />
    </Suspense>
  )
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="蚂蚁AI导航"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            蚂蚁AI导航
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  )
}

function HeaderInner() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ ranking_enabled: true })
  const router = useRouter()

  // 判断菜单项是否激活
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' && !searchParams.get('isFeatured') && !searchParams.get('search') && !searchParams.get('categoryId')
    }
    if (href === '/?isFeatured=true') {
      return searchParams.get('isFeatured') === 'true'
    }
    if (href === '/categories') {
      return pathname === '/categories' || searchParams.get('categoryId') !== null
    }
    if (href === '/news?category=tutorial') {
      return pathname === '/news' && searchParams.get('category') === 'tutorial'
    }
    if (href === '/news') {
      return pathname === '/news' && searchParams.get('category') !== 'tutorial'
    }
    // 对于其他路径，直接匹配 pathname
    return pathname === href || pathname.startsWith(href + '/')
  }

  // 获取激活的菜单项样式
  const getActiveClass = (href: string) => {
    return isActive(href)
      ? 'text-primary font-semibold'
      : 'text-muted-foreground hover:text-foreground'
  }

  useEffect(() => {
    // 获取网站设置
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        setSiteSettings({
          ranking_enabled: data.ranking_enabled ?? true
        })
      })
      .catch(() => {
        // 使用默认值
      })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/logo.png"
            alt="蚂蚁AI导航"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            蚂蚁AI导航
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/')}`}>
            首页
          </Link>
          <Link href="/?isFeatured=true" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/?isFeatured=true')}`}>
            精选
          </Link>
          <Link href="/categories" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/categories')}`}>
            AI分类
          </Link>
          <Link href="/news" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/news')}`}>
            资讯
          </Link>
          <Link href="/ranking" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/ranking')}`}>
            排行榜
          </Link>
          <Link href="/hot-china" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/hot-china')}`}>
            国内热门
          </Link>
          {siteSettings.ranking_enabled && (
            <Link href="/hall-of-fame" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${getActiveClass('/hall-of-fame')}`}>
              名人堂
            </Link>
          )}
        </nav>

        {/* Search and User Actions */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-48 md:w-64 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </form>

          {/* User Actions */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} alt={user.name || ''} />
                    <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || '用户'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    个人中心
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/publisher" className="cursor-pointer flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    发布工具
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    设置
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/tools" className="cursor-pointer flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        管理后台
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${getActiveClass('/')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/?isFeatured=true"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${getActiveClass('/?isFeatured=true')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              精选
            </Link>
            <Link
              href="/categories"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${getActiveClass('/categories')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              AI分类
            </Link>
            <Link
              href="/news"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${getActiveClass('/news')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              资讯
            </Link>
            <Link
              href="/ranking"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${getActiveClass('/ranking')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              排行榜
            </Link>
            <Link
              href="/hot-china"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${getActiveClass('/hot-china')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              国内热门
            </Link>
            {siteSettings.ranking_enabled && (
              <Link
                href="/hall-of-fame"
                className={`block px-3 py-2 rounded-md text-sm font-medium ${getActiveClass('/hall-of-fame')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                名人堂
              </Link>
            )}

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="pt-2 border-t">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索工具..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </form>

            {/* Mobile User Actions */}
            <div className="pt-2 border-t">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    个人中心
                  </Link>
                  <Link
                    href="/publisher"
                    className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    发布工具
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    设置
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/tools"
                      className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理后台
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout()
                      setIsMenuOpen(false)
                    }}
                  >
                    退出登录
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>登录</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>注册</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
