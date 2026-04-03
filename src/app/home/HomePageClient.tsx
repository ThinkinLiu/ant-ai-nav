'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  TrendingUp, Clock, Star, ChevronRight,
  PenTool, Palette, MessageCircle, Code, Music, Video, Briefcase, GraduationCap,
  Flame, Eye, Heart, Zap, Pin,
  Award, Crown, Diamond, Gem, Sparkles,
  Rocket, Target, Flag, Bookmark, Tag, Hash, Layers, Grid3X3,
  Newspaper, BookOpen, FileText, MessageSquare, MessagesSquare,
  Users, User, UserCircle, ThumbsUp, Medal, Trophy,
  Image, Camera, Mic, Headphones,
  Terminal, Cpu, Database, Server, Cloud,
  Brain, Bot, Lightbulb, Puzzle,
  MapPin, Compass, Navigation,
  Calendar, Timer, Hourglass,
  Sun, Moon, Sunrise, Sunset, CloudSun, Droplets, Leaf, Flower2,
  Gift, Package, ShoppingCart, Wallet,
  Bell, BellRing,
  BarChart3, LineChart, PieChart,
  Search, Filter, Settings, Wrench,
  Lock, Key, Shield, ShieldCheck,
  Wifi, Radio, Signal, Satellite,
  Monitor, Smartphone, Laptop, HardDrive,
  FolderOpen, Folder, File, Files, Archive,
  Link2, ExternalLink, Share2,
  Download, Upload, CloudUpload, CloudDownload,
  Play, Pause, SkipForward, Rewind,
  ChevronDown, ChevronUp, ChevronLeft,
  ArrowRight, ArrowDown, ArrowUp, ArrowLeft,
  Check, X, Minus, CheckCircle, XCircle, AlertTriangle, HelpCircle,
  Maximize, Minimize, Expand, Shrink, ZoomIn, ZoomOut,
  Menu, MoreHorizontal, MoreVertical, RefreshCw, RotateCw, Repeat, Shuffle,
  Send, Plane, Globe, Home,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/lib/utils'
import { ToolLogoNext } from '@/components/tools/ToolLogo'
import { AnnouncementBar } from '@/components/announcement/AnnouncementBar'

const iconMap: Record<string, any> = {
  PenTool,
  Palette,
  MessageCircle,
  Code,
  Music,
  Video,
  Briefcase,
  GraduationCap,
  Flame,
  TrendingUp,
  Star,
  Award,
  Crown,
  Diamond,
  Gem,
  Sparkles,
  Rocket,
  Target,
  Flag,
  Bookmark,
  Tag,
  Hash,
  Layers,
  Grid3X3,
  Newspaper,
  BookOpen,
  FileText,
  MessageSquare,
  MessagesSquare,
  Users,
  User,
  UserCircle,
  Heart,
  ThumbsUp,
  Medal,
  Trophy,
  Image,
  Camera,
  Mic,
  Headphones,
  Terminal,
  Cpu,
  Database,
  Server,
  Cloud,
  Brain,
  Bot,
  Lightbulb,
  Puzzle,
  MapPin,
  Compass,
  Navigation,
  Calendar,
  Timer,
  Hourglass,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  Droplets,
  Leaf,
  Flower2,
  Gift,
  Package,
  ShoppingCart,
  Wallet,
  Bell,
  BellRing,
  BarChart3,
  LineChart,
  PieChart,
  Search,
  Filter,
  Settings,
  Wrench,
  Lock,
  Key,
  Shield,
  ShieldCheck,
  Wifi,
  Radio,
  Signal,
  Satellite,
  Monitor,
  Smartphone,
  Laptop,
  HardDrive,
  FolderOpen,
  Folder,
  File,
  Files,
  Archive,
  Link2,
  ExternalLink,
  Share2,
  Download,
  Upload,
  CloudUpload,
  CloudDownload,
  Play,
  Pause,
  SkipForward,
  Rewind,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  Check,
  X,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Maximize,
  Minimize,
  Expand,
  Shrink,
  ZoomIn,
  ZoomOut,
  Menu,
  MoreHorizontal,
  MoreVertical,
  RefreshCw,
  RotateCw,
  Repeat,
  Shuffle,
  Send,
  Plane,
  Globe,
  Home,
  Zap,
  Clock,
  Eye,
}

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  toolCount: number
}

interface Tab {
  id: number
  name: string
  slug: string
  type: string
  source_id: number | null
  icon: string | null
  color: string | null
  sort_order: number
  is_default: boolean
  is_system: boolean
}

interface Tool {
  id: number
  name: string
  slug: string
  description: string
  website: string
  logo: string | null
  is_featured: boolean
  is_pinned: boolean
  is_free: boolean
  view_count: number
  favorite_count: number
  created_at: string
  category: Category
}

interface News {
  id: number
  title: string
  summary: string
  cover_image: string | null
  category: string | null
  published_at: string
  view_count: number
}

interface Fame {
  id: number
  name: string
  name_en?: string | null
  photo: string | null
  title?: string | null
}

interface Timeline {
  id: number
  title: string
  year: number
  month: number | null
  day: number | null
}

interface HomePageClientProps {
  searchQuery: string | null
  categoryId: string | null
  isFeatured: string | null
}

export function HomePageClient({ searchQuery, categoryId, isFeatured }: HomePageClientProps) {
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [totalToolCount, setTotalToolCount] = useState<number>(0)
  const [tools, setTools] = useState<Tool[]>([])
  const [tabs, setTabs] = useState<Tab[]>([])
  const [currentTab, setCurrentTab] = useState<Tab | null>(null)
  const [tabTools, setTabTools] = useState<Tool[]>([])
  const [tabNews, setTabNews] = useState<News[]>([])
  const [tabFame, setTabFame] = useState<Fame[]>([])
  const [tabTimeline, setTabTimeline] = useState<Timeline[]>([])
  const [hotTools, setHotTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [categoriesLoaded, setCategoriesLoaded] = useState<boolean>(false)
  const processedCategoryIdRef = useRef<string | null>(null)
  const { user } = useAuth()

  // 获取原始分类数据（所有工具统计）
  const fetchCategoriesData = useCallback(async () => {
    try {
      const response = await fetch(`/api/home?t=${Date.now()}`, {
        cache: 'no-store'
      })

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 检查 Content-Type
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}`)
      }

      const data = await response.json()

      if (data.success) {
        setCategories(data.data.categories || [])
        setTotalToolCount(data.data.totalToolCount || 0)
        setTabs(data.data.tabs || [])
        setCurrentTab(data.data.currentTab || null)
        setTabTools(data.data.tabTools || [])
        setTabNews(data.data.tabNews || [])
        setTabFame(data.data.tabFame || [])
        setTabTimeline(data.data.tabTimeline || [])
        setHotTools(data.data.hotTools || [])
        setCategoriesLoaded(true)
        setError(null)
      } else {
        console.error('API 返回错误:', data.error)
        setError(data.error || '未知错误')
      }
    } catch (error) {
      console.error('获取分类数据失败:', error)
      setError(error instanceof Error ? error.message : '网络错误')
      // 不设置空数据，保留现有数据
    }
  }, [])

  // 初始加载：获取分类数据
  useEffect(() => {
    fetchCategoriesData()
  }, [fetchCategoriesData])

  // 退出筛选模式时重置页码
  useEffect(() => {
    if (isFeatured !== 'true' && !searchQuery && !categoryId && activeCategory === 'all') {
      setPage(1)
      setHasMore(true)
      fetchCategoriesData()
    }
  }, [isFeatured, searchQuery, categoryId, activeCategory, fetchCategoriesData])

  // 合并加载逻辑：一次性获取所有数据（首页第一页）
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true)
      setPage(1)
      setError(null)

      // 添加重试机制
      const maxRetries = 3
      const retryDelay = 1000 // 1秒

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // 使用 /api/tools 端点，支持分页
          const response = await fetch(`/api/tools?page=1&limit=16&sortBy=created_at&sortOrder=desc&t=${Date.now()}`, {
            cache: 'no-store'
          })

          // 检查响应状态
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          // 检查 Content-Type
          const contentType = response.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Invalid content type: ${contentType}`)
          }

          const data = await response.json()

          if (data.success) {
            // 获取首页所需的分类和Tab数据
            const homeResponse = await fetch(`/api/home?t=${Date.now()}`, {
              cache: 'no-store'
            })

            if (homeResponse.ok) {
              const homeData = await homeResponse.json()
              if (homeData.success) {
                setCategories(homeData.data.categories || [])
                setTotalToolCount(homeData.data.totalToolCount || 0)
                setTabs(homeData.data.tabs || [])
                setCurrentTab(homeData.data.currentTab || null)
                setTabTools(homeData.data.tabTools || [])
                setTabNews(homeData.data.tabNews || [])
                setTabFame(homeData.data.tabFame || [])
                setTabTimeline(homeData.data.tabTimeline || [])
                setHotTools(homeData.data.hotTools || [])
              }
            }

            // 设置工具列表数据
            const latestTools = data.data?.data || []
            console.log('📦 加载最新工具数据:', latestTools.length, '个工具')
            setTools(latestTools)
            setHasMore(data.data.total > latestTools.length)
            setError(null)
            setLoading(false) // 确保在成功时设置 loading 为 false
            return // 成功，退出重试循环
          } else {
            console.error('API 返回错误:', data.error)
            if (attempt === maxRetries - 1) {
              setError(data.error || '未知错误')
            }
          }
        } catch (error) {
          console.error(`获取首页数据失败 (尝试 ${attempt + 1}/${maxRetries}):`, error)

          // 如果不是最后一次尝试，等待后重试
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            continue
          }

          // 最后一次尝试失败，设置错误
          setError(error instanceof Error ? error.message : '网络错误')
        }
      }

      // 确保在所有情况下都设置 loading 为 false
      setLoading(false)
    }

    // 只有在没有筛选条件时才加载首页默认数据
    if (!searchQuery && !categoryId && !isFeatured && activeCategory === 'all') {
      fetchAllData()
    }
  }, [searchQuery, categoryId, isFeatured, activeCategory])

  // 加载更多工具
  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const nextPage = page + 1

    try {
      // 构建请求参数，包含当前的筛选条件
      const params = new URLSearchParams()
      params.append('page', nextPage.toString())
      params.append('limit', '16')
      params.append('sortBy', 'created_at')
      params.append('sortOrder', 'desc')

      // 添加筛选条件
      if (searchQuery) params.append('search', searchQuery)
      if (categoryId) params.append('categoryId', categoryId)
      if (isFeatured === 'true') params.append('isFeatured', 'true')
      if (activeCategory !== 'all') {
        const cat = categories.find(c => c.slug === activeCategory)
        if (cat) params.append('categoryId', cat.id.toString())
      }

      const response = await fetch(`/api/tools?${params}&t=${Date.now()}`, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}`)
      }

      const data = await response.json()

      if (data.success) {
        const newTools = data.data?.data || []
        console.log('📦 加载更多工具数据:', newTools.length, '个工具')
        setTools(prev => [...prev, ...newTools])
        setPage(nextPage)
        setHasMore(data.data.total > (page * 16) + newTools.length)
      } else {
        console.error('API 返回错误:', data.error)
        setError(data.error || '加载失败')
      }
    } catch (error) {
      console.error('加载更多工具失败:', error)
      setError(error instanceof Error ? error.message : '网络错误')
    } finally {
      setLoadingMore(false)
    }
  }

  const fetchFilteredTools = useCallback(async () => {
    setLoading(true)
    setPage(1)
    setHasMore(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (categoryId) params.append('categoryId', categoryId)
      if (isFeatured === 'true') params.append('isFeatured', 'true')
      if (activeCategory !== 'all') {
        const cat = categories.find(c => c.slug === activeCategory)
        if (cat) params.append('categoryId', cat.id.toString())
      }
      const limit = isFeatured === 'true' ? '500' : '20'
      params.append('limit', limit)

      const response = await fetch(`/api/tools?${params}`)
      const data = await response.json()
      if (data.success) {
        setTools(data.data?.data || [])
        // 精选推荐模式下更新分类统计（仅在首次加载时）
        if (isFeatured === 'true' && data.data?.categories) {
          setCategories(data.data.categories)
          setTotalToolCount(data.data.totalToolCount || data.data.total || 0)
        }
        // 设置是否有更多数据
        setHasMore(data.data.total > (data.data?.data?.length || 0))
      }
    } catch (error) {
      console.error('获取工具失败:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryId, isFeatured, activeCategory]) // 移除 categories 依赖，避免无限循环

  // 搜索/筛选时单独请求
  useEffect(() => {
    if (searchQuery || categoryId || isFeatured || activeCategory !== 'all') {
      fetchFilteredTools()
    }
  }, [searchQuery, categoryId, isFeatured, activeCategory, fetchFilteredTools])

  // 根据 URL 参数 categoryId 自动选中对应的分类 tab
  useEffect(() => {
    // 如果 categoryId 没有变化，跳过
    if (categoryId === processedCategoryIdRef.current) return

    // 如果 categoryId 存在且 categories 已加载，设置对应的分类
    if (categoryId && categories.length > 0) {
      const category = categories.find(c => c.id === parseInt(categoryId))
      if (category && category.slug) {
        setActiveCategory(category.slug)
      }
      processedCategoryIdRef.current = categoryId
    } else if (!categoryId && !searchQuery && !isFeatured) {
      // 如果没有 categoryId、searchQuery 和 isFeatured，则重置为 'all'
      setActiveCategory('all')
      processedCategoryIdRef.current = null
    }
  }, [categoryId, categories, searchQuery, isFeatured]) // 恢复依赖，但使用 ref 避免重复处理

  // 切换Tab
  const handleTabChange = async (slug: string) => {
    const tab = tabs.find(t => t.slug === slug)
    if (!tab) return

    setTabLoading(true)
    setCurrentTab(tab)

    try {
      const response = await fetch(`/api/home?tab=${slug}&t=${Date.now()}`, {
        cache: 'no-store'
      })

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 检查 Content-Type
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid content type: ${contentType}`)
      }

      const data = await response.json()

      if (data.success) {
        setTabTools(data.data.tabTools || [])
        setTabNews(data.data.tabNews || [])
        setTabFame(data.data.tabFame || [])
        setTabTimeline(data.data.tabTimeline || [])
      } else {
        console.error('API 返回错误:', data.error)
        setError(data.error || '未知错误')
      }
    } catch (error) {
      console.error('获取Tab数据失败:', error)
      setError(error instanceof Error ? error.message : '网络错误')
    } finally {
      setTabLoading(false)
    }
  }

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)

    // 更新 URL 参数
    const params = new URLSearchParams(window.location.search)

    if (slug === 'all') {
      // 点击"全部"时，移除 categoryId 参数
      params.delete('categoryId')
    } else {
      // 点击具体分类时，设置 categoryId 参数
      const category = categories.find(c => c.slug === slug)
      if (category) {
        params.set('categoryId', category.id.toString())
      }
    }

    // 保留其他参数（如 search、isFeatured）
    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.replace(newUrl, { scroll: false })
  }

  // 获取Tab图标
  const getTabIcon = (iconName: string | null) => {
    if (!iconName) return Star
    return iconMap[iconName] || Star
  }

  // 收藏本站功能
  const handleBookmark = () => {
    const title = document.title
    const url = window.location.href

    // 尝试使用 IE/Edge 方法
    try {
      if (typeof window !== 'undefined' && 'external' in window && (window as any).external && 'addFavorite' in (window as any).external) {
        (window as any).external.addFavorite(url, title)
        return
      }
    } catch (e) {
      // IE/Edge 方法失败，继续尝试其他方法
    }

    // 尝试使用 Firefox 方法
    try {
      if (typeof window !== 'undefined' && 'sidebar' in window && (window as any).sidebar && 'addPanel' in (window as any).sidebar) {
        (window as any).sidebar.addPanel(title, url, '')
        return
      }
    } catch (e) {
      // Firefox 方法失败，继续尝试其他方法
    }

    // Opera Hotlist
    try {
      if (typeof window !== 'undefined' && 'opera' in window && (window as any).opera) {
        const bookmarkLink = document.createElement('a')
        bookmarkLink.setAttribute('rel', 'sidebar')
        bookmarkLink.setAttribute('href', url)
        bookmarkLink.setAttribute('title', title)
        bookmarkLink.click()
        return
      }
    } catch (e) {
      // Opera 方法失败，继续尝试其他方法
    }

    // 现代浏览器提示用户使用快捷键
    const userAgent = navigator.userAgent.toLowerCase()
    let message = ''

    if (userAgent.indexOf('mac') !== -1) {
      message = '请按 Cmd + D 将本站加入书签'
    } else if (userAgent.indexOf('win') !== -1) {
      message = '请按 Ctrl + D 将本站加入书签'
    } else {
      message = '请使用浏览器菜单将本站加入书签'
    }

    alert(message)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                发现最好的AI工具
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              蚂蚁AI导航收录全网优秀AI工具，助你提升工作效率，释放创造力
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/categories">
                  开始探索
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 cursor-pointer"
                onClick={handleBookmark}
              >
                <Bookmark className="h-4 w-4" />
                收藏本站
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl" />
      </section>

      {/* 公告滚动条 */}
      <AnnouncementBar />

      {/* Categories Section - 非精选推荐模式下显示 */}
      {isFeatured !== 'true' && (
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  全部
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {totalToolCount}
                  </Badge>
                </TabsTrigger>
                {categories.map((category) => {
                  const Icon = category.icon ? iconMap[category.icon] : Star
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.slug}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon className="mr-1 h-4 w-4" />
                      {category.name}
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {category.toolCount}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </div>
        </section>
      )}

      {/* 首页Tab展示 */}
      {!searchQuery && !categoryId && !isFeatured && activeCategory === 'all' && tabs.length > 0 && (
        <section className="py-8 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20">
          <div className="container mx-auto px-4">
            <Tabs value={currentTab?.slug || tabs[0]?.slug} onValueChange={handleTabChange}>
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
                {tabs.map((tab) => {
                  const Icon = getTabIcon(tab.icon)
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.slug}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      style={tab.color ? {
                        '--tab-active-bg': tab.color,
                      } as React.CSSProperties : {}}
                    >
                      <Icon className="mr-1 h-4 w-4" />
                      {tab.name}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>

            {/* Tab内容 */}
            {tabLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden h-full">
                    <CardContent className="p-4 text-center">
                      <div className="h-12 w-12 mx-auto bg-muted rounded-full mb-2 animate-pulse" />
                      <div className="h-4 bg-muted rounded mb-1 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-3/4 mx-auto animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* 工具Tab */}
                {currentTab?.type === 'tools' && tabTools.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {tabTools.map((tool) => (
                      <Link key={tool.id} href={`/tool/${tool.slug}`} className="group">
                        <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary">
                          <CardContent className="p-4 text-center">
                            <ToolLogoNext
                              tool={tool}
                              size={48}
                              className="mx-auto mb-2 transition-transform duration-200 group-hover:scale-110"
                            />
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* AI名人堂Tab */}
                {currentTab?.type === 'fame' && tabFame.length > 0 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4">
                    {tabFame.map((fame) => (
                      <Link key={fame.id} href={`/hall-of-fame/${fame.id}`} className="group">
                        <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer">
                          <CardContent className="p-3 text-center">
                            <div className="relative w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                              {fame.photo ? (
                                <img
                                  src={fame.photo}
                                  alt={fame.name}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                                  {fame.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <h3 className="font-semibold text-xs truncate group-hover:text-primary transition-colors">
                              {fame.name}
                            </h3>
                            {fame.title && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {fame.title}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 资讯Tab */}
                {currentTab?.type === 'articles' && tabNews.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tabNews.map((news) => (
                      <Link key={news.id} href={`/article/${news.id}`} className="group">
                        <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer">
                          {news.cover_image && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={news.cover_image}
                                alt={news.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              {news.category && (
                                <Badge className="absolute top-2 right-2 bg-primary/90">
                                  {news.category}
                                </Badge>
                              )}
                            </div>
                          )}
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {news.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {news.summary}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {news.view_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(news.published_at)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 大事纪Tab */}
                {currentTab?.type === 'timeline' && tabTimeline.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tabTimeline.map((timeline) => (
                      <Link key={timeline.id} href={`/timeline/${timeline.id}`} className="group">
                        <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border-2 hover:border-primary">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {timeline.month ? (
                                  <div className="text-center">
                                    <div className="text-2xl leading-none">{timeline.month}</div>
                                    <div className="text-xs opacity-90">{timeline.year}</div>
                                  </div>
                                ) : (
                                  <div className="text-xl">{timeline.year}</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                                  {timeline.title}
                                </h3>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Tools Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {searchQuery ? `搜索结果: "${searchQuery}"` :
               isFeatured === 'true' ? '✨ 精选推荐' :
               categoryId ? `${categories.find(c => c.id === parseInt(categoryId))?.name || '分类工具'}` :
               activeCategory === 'all' ? '🚀 最新工具' :
               `${categories.find(c => c.slug === activeCategory)?.name || '分类工具'}`}
            </h2>
            <p className="text-muted-foreground">
              共 {tools.length} 个工具
            </p>
          </div>

          {/* 热门工具（仅在首页默认视图下显示） */}
          {!searchQuery && !categoryId && !isFeatured && activeCategory === 'all' && hotTools.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="text-xl font-semibold">热门工具</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {hotTools.slice(0, 4).map((tool) => (
                  <Link key={tool.id} href={`/tool/${tool.slug}`} className="group">
                    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <ToolLogoNext tool={tool} size={48} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {tool.name}
                              </h3>
                              {tool.is_pinned && (
                                <Badge className="shrink-0 text-xs bg-purple-100 text-purple-700 border-purple-200">
                                  <Pin className="h-3 w-3 mr-0.5" />
                                  置顶
                                </Badge>
                              )}
                              {tool.is_featured && (
                                <Badge variant="default" className="shrink-0 text-xs">精选</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {tool.category?.name || '未分类'}
                          </Badge>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {tool.favorite_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {tool.view_count || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 bg-muted rounded-lg animate-pulse" />
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded mb-2 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <Link key={tool.id} href={`/tool/${tool.slug}`} className="group">
                  <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer border-2 hover:border-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <ToolLogoNext tool={tool} size={48} className="transition-transform duration-200 group-hover:scale-110" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            {tool.is_pinned && (
                              <Badge className="shrink-0 text-xs bg-purple-100 text-purple-700 border-purple-200">
                                <Pin className="h-3 w-3 mr-0.5" />
                                置顶
                              </Badge>
                            )}
                            {tool.is_featured && (
                              <Badge variant="default" className="shrink-0 text-xs">精选</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {tool.category?.name || '未分类'}
                        </Badge>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {tool.favorite_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(tool.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {tool.is_free ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            免费
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            付费
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* 查看更多按钮 */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="gap-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {loadingMore ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      加载中...
                    </>
                  ) : (
                    <>
                      查看更多
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">暂无相关工具</h3>
              <p className="text-muted-foreground">尝试其他搜索词或浏览其他分类</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            有好用的AI工具想要分享？
          </h2>
          <p className="text-blue-100 mb-8">
            成为发布者，分享你发现的AI工具，让更多人受益
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href={user ? "/publisher" : "/register"}>
              {user ? "发布工具" : "立即注册"}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
