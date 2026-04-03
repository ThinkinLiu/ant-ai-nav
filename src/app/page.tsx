'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  // 新增图标 - 与管理后台保持同步
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
  // 新增图标
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

interface HomeData {
  categories: Category[]
  totalToolCount: number
  tabs: Tab[]
  currentTab: Tab | null
  tabTools: Tool[]
  tabNews: News[]
  tabFame: Fame[]
  tabTimeline: Timeline[]
  hotTools: Tool[]
  latestTools: Tool[]
}

function HomePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQuery = searchParams.get('search')
  const categoryId = searchParams.get('categoryId')
  const isFeatured = searchParams.get('isFeatured')
  
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
    const params = new URLSearchParams(searchParams.toString())

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
                      <div className="h-12 w-12 mx-auto rounded-lg bg-muted animate-pulse mb-3" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {/* 工具类型Tab */}
                {['hot_tools', 'domestic_tools', 'foreign_tools', 'lobster_tools', 'category', 'tag', 'ranking'].includes(currentTab?.type || '') && tabTools.length > 0 && (
                  <div>
                    {/* 国内火爆/国外火爆/龙虾专区显示更多按钮 */}
                    {['domestic_tools', 'foreign_tools'].includes(currentTab?.type || '') && (
                      <div className="flex justify-end mb-4">
                        <Button variant="outline" size="sm" asChild className="gap-1">
                          <Link href={`/tools?filter=${currentTab?.type === 'domestic_tools' ? 'domestic' : 'foreign'}`}>
                            更多
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                    {/* 龙虾专区显示更多按钮 */}
                    {currentTab?.type === 'lobster_tools' && (
                      <div className="flex justify-end mb-4">
                        <Button variant="outline" size="sm" asChild className="gap-1">
                          <Link href="/tags/lobster">
                            更多工具与龙虾教程
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                      {tabTools.map((tool) => (
                        <Link key={`tab-${tool.id}`} href={`/tools/${tool.id}`}>
                          <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                            <CardContent className="p-4 text-center">
                              <div className="h-12 w-12 mx-auto rounded-lg overflow-hidden mb-3">
                                <ToolLogoNext 
                                  logo={tool.logo} 
                                  name={tool.name} 
                                  website={tool.website}
                                  className="h-full w-full rounded-lg"
                                  size={48}
                                  fallbackBgColor={tool.category?.color || currentTab?.color || '#EF4444'}
                                />
                              </div>
                              <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {tool.category?.name || 'AI工具'}
                              </p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 热门教程Tab */}
                {currentTab?.type === 'tutorial_tools' && tabNews.length > 0 && (
                  <div>
                    <div className="flex justify-end mb-4">
                      <Button variant="outline" size="sm" asChild className="gap-1">
                        <Link href="/news?category=tutorial">
                          更多教程
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <Card className="overflow-hidden">
                      <CardContent className="py-1.5 px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                          {tabNews.map((news, index) => (
                            <Link 
                              key={news.id} 
                              href={`/news/${news.id}`}
                              className="flex items-start gap-2 py-1 group hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                            >
                              <span className="text-xs text-muted-foreground w-5 shrink-0 pt-0.5">
                                {index + 1}.
                              </span>
                              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1 min-w-0" style={{ minHeight: '2.5rem' }}>
                                {news.title}
                              </h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">
                                {formatRelativeTime(news.published_at)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* 资讯类型Tab */}
                {currentTab?.type === 'news' && tabNews.length > 0 && (
                  <Card className="overflow-hidden">
                    <CardContent className="py-1.5 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                        {tabNews.map((news, index) => (
                          <Link 
                            key={news.id} 
                            href={`/news/${news.id}`}
                            className="flex items-start gap-2 py-1 group hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                          >
                            <span className="text-xs text-muted-foreground w-5 shrink-0 pt-0.5">
                              {index + 1}.
                            </span>
                            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1 min-w-0" style={{ minHeight: '2.5rem' }}>
                              {news.title}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">
                              {formatRelativeTime(news.published_at)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 名人堂类型Tab */}
                {currentTab?.type === 'fame' && tabFame.length > 0 && (
                  <div className="flex flex-wrap gap-4 justify-center">
                    {tabFame.map((person) => (
                      <Link key={person.id} href={`/hall-of-fame/${person.id}`} className="flex flex-col items-center group">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 group-hover:ring-4 ring-primary/20 transition-all">
                          {person.photo ? (
                            <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                              {person.name?.[0] || 'A'}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium mt-2 truncate max-w-[80px] text-center group-hover:text-primary transition-colors">
                          {person.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* 大事纪类型Tab */}
                {currentTab?.type === 'timeline' && tabTimeline.length > 0 && (
                  <Card className="overflow-hidden">
                    <CardContent className="py-1.5 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
                        {tabTimeline.map((event, index) => (
                          <Link 
                            key={event.id} 
                            href={`/timeline/${event.id}`}
                            className="flex items-start gap-2 py-1 group hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
                          >
                            <span className="text-xs text-muted-foreground w-5 shrink-0 pt-0.5">
                              {index + 1}.
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">
                              {event.year}{event.month ? `.${event.month}` : ''}{event.day ? `.${event.day}` : ''}
                            </span>
                            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1 min-w-0" style={{ minHeight: '2.5rem' }}>
                              {event.title}
                            </h3>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 空状态 */}
                {tabTools.length === 0 && tabNews.length === 0 && tabFame.length === 0 && tabTimeline.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🔍</span>
                    <p className="text-muted-foreground">该Tab暂无内容</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* 最新上架 */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Sort Options */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `搜索结果: ${searchQuery}` : 
               isFeatured === 'true' ? '精选推荐' : '最新上架'}
            </h2>
            
            {/* 热门推荐下拉菜单 - 非精选推荐模式下显示 */}
            {isFeatured !== 'true' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 cursor-pointer hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 dark:hover:bg-orange-950 dark:hover:text-orange-400">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>热门推荐</span>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2">
                  <DropdownMenuLabel className="flex items-center gap-2 text-base">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span>🔥 热门工具 TOP 6</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                
                {hotTools.length > 0 ? (
                  hotTools.map((tool, index) => (
                    <DropdownMenuItem key={`hot-${tool.id}`} asChild className="cursor-pointer p-0">
                      <Link href={`/tools/${tool.id}`} className="flex items-start gap-3 p-3 w-full hover:bg-muted/50 rounded-md">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{tool.name}</span>
                            {tool.is_featured && (
                              <Badge variant="default" className="shrink-0 text-[10px] px-1 py-0">精选</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {tool.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {(tool.view_count || 0).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {(tool.favorite_count || 0).toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1 py-0">
                              {tool.category?.name || '未分类'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-0.5">
                          {index < 3 && (
                            <>
                              <Zap className="h-3 w-3 text-orange-500" />
                              <Zap className="h-3 w-3 text-orange-500" />
                              {index === 0 && <Zap className="h-3 w-3 text-orange-500" />}
                            </>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground text-sm">
                    暂无热门工具数据
                  </div>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer justify-center text-primary">
                  <Link href="/tools?sortBy=view_count&sortOrder=desc" className="gap-1">
                    查看更多热门工具
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            )}
          </div>

          {/* 精选推荐模式下的分类Tab */}
          {isFeatured === 'true' && (
            <div className="mb-6">
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
          )}

          {/* Tools Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-4/5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">数据加载失败</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => {
                setError(null)
                setLoading(true)
                fetchCategoriesData()
              }}>
                重新加载
              </Button>
            </div>
          ) : tools.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                已加载 {tools.length} 个工具
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tools.map((tool) => (
                  <Link key={`main-${tool.id}`} href={`/tools/${tool.id}`}>
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden shrink-0">
                            <ToolLogoNext
                              logo={tool.logo}
                              name={tool.name}
                              website={tool.website}
                              className="h-full w-full rounded-lg"
                              size={48}
                            fallbackBgColor={tool.category?.color || '#6366F1'}
                          />
                        </div>
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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  )
}
