'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, Users, FileCheck, BarChart3, ArrowLeft, MessageCircle, 
  UserCheck, Settings, Trophy, Database, Newspaper, Award, Calendar, Mail, 
  Link2, HardDriveDownload, Layers, Tags, ChevronDown, ChevronRight,
  FolderOpen, UsersRound, Cog, DatabaseBackup, LayoutGrid, Megaphone, Key, Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 菜单项类型
interface NavItem {
  href?: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// 菜单分组类型
interface NavGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

// 菜单配置
const navGroups: NavGroup[] = [
  {
    title: '数据概览',
    icon: BarChart3,
    items: [
      { href: '/admin', label: '仪表盘', icon: BarChart3 },
    ]
  },
  {
    title: '内容管理',
    icon: FolderOpen,
    items: [
      { href: '/admin/tools', label: '工具审核', icon: FileCheck },
      { href: '/admin/categories', label: '工具分类', icon: Layers },
      { href: '/admin/tags', label: '标签管理', icon: Tags },
      { href: '/admin/news', label: 'AI资讯', icon: Newspaper },
      { href: '/admin/news-categories', label: '资讯分类', icon: Tags },
      { href: '/admin/hall-of-fame', label: '名人堂管理', icon: Award },
      { href: '/admin/timeline', label: '大事纪管理', icon: Calendar },
    ]
  },
  {
    title: '用户管理',
    icon: UsersRound,
    items: [
      { href: '/admin/users', label: '用户列表', icon: Users },
      { href: '/admin/applications', label: '发布者审核', icon: UserCheck },
      { href: '/admin/comments', label: '评论管理', icon: MessageCircle },
    ]
  },
  {
    title: '系统设置',
    icon: Cog,
    items: [
      { href: '/admin/home-tabs', label: '首页Tab管理', icon: LayoutGrid },
      { href: '/admin/announcements', label: '公告管理', icon: Megaphone },
      { href: '/admin/friend-links', label: '友情链接', icon: Link2 },
      { href: '/admin/traffic-sources', label: '排行榜配置', icon: Trophy },
      { href: '/admin/seo', label: 'SEO设置', icon: Settings },
      { href: '/admin/smtp', label: '邮件服务', icon: Mail },
      { href: '/admin/oauth', label: '社交登录', icon: Key },
      { href: '/admin/sms', label: '短信服务', icon: Phone },
    ]
  },
  {
    title: '数据管理',
    icon: DatabaseBackup,
    items: [
      { href: '/admin/generate-tools', label: '批量导入', icon: Database },
      { href: '/admin/data-migration', label: '数据迁移', icon: HardDriveDownload },
    ]
  },
]

// 获取所有路径
const allPaths = navGroups.flatMap(g => g.items.map(i => i.href)).filter(Boolean)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  // 展开状态：默认全部展开
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    return navGroups.map(g => g.title)
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // 切换分组展开状态
  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回首页
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-semibold">管理后台</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <nav className="space-y-1">
              {navGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.title)
                const isActive = group.items.some(item => item.href === pathname)
                const GroupIcon = group.icon
                
                return (
                  <div key={group.title} className="space-y-1">
                    {/* 分组标题 */}
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <GroupIcon className="h-4 w-4" />
                        <span>{group.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* 子菜单 */}
                    {isExpanded && (
                      <div className="ml-4 pl-3 border-l space-y-1">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon
                          const isItemActive = item.href === pathname
                          
                          return item.href ? (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                                isItemActive 
                                  ? "bg-primary text-primary-foreground" 
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              <ItemIcon className="h-3.5 w-3.5" />
                              {item.label}
                            </Link>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
