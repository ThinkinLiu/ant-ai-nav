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
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface SiteSettings {
  ranking_enabled: boolean
}

export function Header() {
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
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/" className={`text-sm font-medium transition-colors ${getActiveClass('/')}`}>
            首页
          </Link>
          <Link href="/?isFeatured=true" className={`text-sm font-medium transition-colors ${getActiveClass('/?isFeatured=true')}`}>
            精选推荐
          </Link>
          <Link href="/categories" className={`text-sm font-medium transition-colors ${getActiveClass('/categories')}`}>
            AI分类
          </Link>
          <Link href="/news?category=tutorial" className={`text-sm font-medium transition-colors ${getActiveClass('/news?category=tutorial')}`}>
            AI教程
          </Link>
          {siteSettings.ranking_enabled && (
            <Link href="/ranking" className={`text-sm font-medium transition-colors ${getActiveClass('/ranking')}`}>
              排行榜
            </Link>
          )}
          <Link href="/news" className={`text-sm font-medium transition-colors ${getActiveClass('/news')}`}>
            AI资讯
          </Link>
          <Link href="/hall-of-fame" className={`text-sm font-medium transition-colors ${getActiveClass('/hall-of-fame')}`}>
            AI名人堂
          </Link>
          <Link href="/timeline" className={`text-sm font-medium transition-colors ${getActiveClass('/timeline')}`}>
            AI大事纪
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索AI工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-full border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </form>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {user.role === 'publisher' || user.role === 'admin' ? (
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link href="/publisher/tools/new">
                    <Plus className="mr-1 h-4 w-4" />
                    发布工具
                  </Link>
                </Button>
              ) : null}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || undefined} alt={user.name || '用户'} />
                      <AvatarFallback>{user.name?.[0] || user.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || '用户'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-primary mt-1">
                        {user.role === 'admin' ? '管理员' : user.role === 'publisher' ? '发布者' : '普通用户'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      个人中心
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">
                      <Settings className="mr-2 h-4 w-4" />
                      我的收藏
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'publisher' || user.role === 'admin') && (
                    <DropdownMenuItem asChild>
                      <Link href="/publisher">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        发布者中心
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        管理后台
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索AI工具..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </form>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/')}`} onClick={() => setIsMenuOpen(false)}>
                首页
              </Link>
              <Link href="/?isFeatured=true" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/?isFeatured=true')}`} onClick={() => setIsMenuOpen(false)}>
                精选推荐
              </Link>
              <Link href="/categories" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/categories')}`} onClick={() => setIsMenuOpen(false)}>
                AI分类
              </Link>
              <Link href="/news?category=tutorial" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/news?category=tutorial')}`} onClick={() => setIsMenuOpen(false)}>
                AI教程
              </Link>
              {siteSettings.ranking_enabled && (
                <Link href="/ranking" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/ranking')}`} onClick={() => setIsMenuOpen(false)}>
                  排行榜
                </Link>
              )}
              <Link href="/news" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/news')}`} onClick={() => setIsMenuOpen(false)}>
                AI资讯
              </Link>
              <Link href="/hall-of-fame" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/hall-of-fame')}`} onClick={() => setIsMenuOpen(false)}>
                AI名人堂
              </Link>
              <Link href="/timeline" className={`text-sm font-medium py-2 transition-colors ${getActiveClass('/timeline')}`} onClick={() => setIsMenuOpen(false)}>
                AI大事纪
              </Link>
              {user ? (
                <>
                  <Link href="/profile" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    个人中心
                  </Link>
                  <Link href="/favorites" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    我的收藏
                  </Link>
                  {(user.role === 'publisher' || user.role === 'admin') && (
                    <Link href="/publisher" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                      发布者中心
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                      管理后台
                    </Link>
                  )}
                  <button 
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="text-sm font-medium py-2 text-left text-red-500"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    登录
                  </Link>
                  <Link href="/register" className="text-sm font-medium py-2" onClick={() => setIsMenuOpen(false)}>
                    注册
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
