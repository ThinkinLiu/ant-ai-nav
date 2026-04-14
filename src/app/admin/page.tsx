'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  MessageCircle,
  TrendingUp,
  XCircle,
  Award,
  Calendar,
  Newspaper,
  Star,
  Sparkles,
  Eye,
} from 'lucide-react'

interface Stats {
  // 用户相关
  totalUsers: number
  publisherCount: number
  
  // 工具相关
  totalTools: number
  pendingTools: number
  approvedTools: number
  rejectedTools: number
  
  // 评论相关
  totalComments: number
  
  // 名人堂相关
  hallOfFameCount: number
  featuredPeopleCount: number
  
  // 大事纪相关
  timelineCount: number
  landmarkEventsCount: number
  
  // 资讯相关
  newsCount: number
  publishedNewsCount: number
  pendingNewsCount: number
}

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [token])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">数据概览</h1>

      {/* 快捷操作 - 移至顶部 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            快捷操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* 新增操作 */}
            <Link
              href="/admin/tools/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              新增工具
            </Link>
            <Link
              href="/admin/news/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Newspaper className="h-4 w-4" />
              新增资讯
            </Link>
            <Link
              href="/admin/hall-of-fame/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Award className="h-4 w-4" />
              新增名人
            </Link>
            <Link
              href="/admin/timeline/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              新增大事纪
            </Link>
            
            {/* 审核操作 */}
            {(stats?.pendingTools ?? 0) > 0 && (
              <Link
                href="/admin/tools?status=pending"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Clock className="h-4 w-4" />
                审核待处理工具
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {stats?.pendingTools ?? 0}
                </span>
              </Link>
            )}
            {(stats?.pendingNewsCount ?? 0) > 0 && (
              <Link
                href="/admin/news?status=pending"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Clock className="h-4 w-4" />
                审核待发布资讯
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {stats?.pendingNewsCount ?? 0}
                </span>
              </Link>
            )}
            <Link
              href="/admin/applications?status=pending"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <Users className="h-4 w-4" />
              审核发布者申请
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 工具统计 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              工具管理
            </CardTitle>
            <Link href="/admin/tools" className="text-sm text-primary hover:underline">
              查看全部 →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/tools?status=all">
              <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <p className="text-sm text-muted-foreground">总工具数</p>
                <p className="text-2xl font-bold">{stats?.totalTools || 0}</p>
              </div>
            </Link>
            <Link href="/admin/tools?status=pending">
              <div className="p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">待审核</p>
                  {(stats?.pendingTools ?? 0) > 0 && (
                    <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                      {stats?.pendingTools ?? 0}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingTools ?? 0}</p>
              </div>
            </Link>
            <Link href="/admin/tools?status=approved">
              <div className="p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                <p className="text-sm text-muted-foreground">已通过</p>
                <p className="text-2xl font-bold text-green-600">{stats?.approvedTools || 0}</p>
              </div>
            </Link>
            <Link href="/admin/tools?status=rejected">
              <div className="p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                <p className="text-sm text-muted-foreground">已拒绝</p>
                <p className="text-2xl font-bold text-red-600">{stats?.rejectedTools || 0}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 名人堂 & 大事纪 & 资讯 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 名人堂 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                AI名人堂
              </CardTitle>
              <Link href="/admin/hall-of-fame" className="text-sm text-primary hover:underline">
                管理 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">总人物数</span>
                </div>
                <span className="text-xl font-bold">{stats?.hallOfFameCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">置顶人物</span>
                </div>
                <span className="text-xl font-bold text-amber-600">{stats?.featuredPeopleCount ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 大事纪 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                AI大事纪
              </CardTitle>
              <Link href="/admin/timeline" className="text-sm text-primary hover:underline">
                管理 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">总事件数</span>
                </div>
                <span className="text-xl font-bold">{stats?.timelineCount || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">里程碑事件</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{stats?.landmarkEventsCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI资讯 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-green-500" />
                AI资讯
              </CardTitle>
              <Link href="/admin/news" className="text-sm text-primary hover:underline">
                管理 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">总资讯数</span>
                </div>
                <span className="text-xl font-bold">{stats?.newsCount || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="text-sm">已发布</span>
                </div>
                <span className="text-xl font-bold text-green-600">{stats?.publishedNewsCount || 0}</span>
              </div>
              {(stats?.pendingNewsCount || 0) > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">待审核</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">{stats?.pendingNewsCount || 0}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户 & 评论 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 用户管理 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-500" />
                用户管理
              </CardTitle>
              <Link href="/admin/users" className="text-sm text-primary hover:underline">
                查看全部 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/users">
                <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">总用户数</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
              </Link>
              <Link href="/admin/users?role=publisher">
                <div className="p-4 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-muted-foreground">发布者</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-600">{stats?.publisherCount || 0}</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 评论管理 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                评论管理
              </CardTitle>
              <Link href="/admin/comments" className="text-sm text-primary hover:underline">
                查看全部 →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-lg bg-muted/50 text-center">
              <MessageCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">总评论数</p>
              <p className="text-3xl font-bold">{stats?.totalComments || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
