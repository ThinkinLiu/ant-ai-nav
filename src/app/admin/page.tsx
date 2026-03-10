'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Users, FileText, CheckCircle, Clock, MessageCircle, TrendingUp, XCircle } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalTools: number
  pendingTools: number
  approvedTools: number
  rejectedTools: number
  totalComments: number
  publisherCount: number
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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">数据概览</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 总用户数 - 跳转用户列表 */}
        <Link href="/admin/users">
          <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总用户数</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 总工具数 - 跳转工具审核（全部） */}
        <Link href="/admin/tools?status=all">
          <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总工具数</p>
                  <p className="text-2xl font-bold">{stats?.totalTools || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 待审核 - 跳转工具审核（待审核） */}
        <Link href="/admin/tools?status=pending">
          <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审核</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats?.pendingTools || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 已通过 - 跳转工具审核（已通过） */}
        <Link href="/admin/tools?status=approved">
          <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已通过</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.approvedTools || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 已拒绝 - 跳转工具审核（已拒绝） */}
        <Link href="/admin/tools?status=rejected">
          <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已拒绝</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.rejectedTools || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 总评论数 - 跳转评论管理 */}
        <Link href="/admin/comments">
          <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总评论数</p>
                  <p className="text-2xl font-bold">{stats?.totalComments || 0}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 发布者数量 - 跳转用户列表（发布者筛选） */}
        <Link href="/admin/users?role=publisher">
          <Card className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">发布者数量</p>
                  <p className="text-2xl font-bold">{stats?.publisherCount || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 快捷操作 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/tools?status=pending"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Clock className="h-4 w-4" />
            审核待处理工具
            {stats?.pendingTools && stats.pendingTools > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {stats.pendingTools}
              </span>
            )}
          </Link>
          <Link
            href="/admin/applications?status=pending"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Users className="h-4 w-4" />
            审核发布者申请
          </Link>
          <Link
            href="/admin/comments"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            管理评论
          </Link>
        </div>
      </div>
    </div>
  )
}
