'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'

interface Tool {
  id: number
  name: string
  description: string
  status: string
  view_count: number
  favorite_count: number
  created_at: string
  is_featured: boolean
  reject_reason: string | null
  category: { name: string } | null
}

export default function PublisherDashboard() {
  const { user, token } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })

  useEffect(() => {
    if (user && token) {
      fetchMyTools()
    }
  }, [user, token])

  const fetchMyTools = async () => {
    try {
      const response = await fetch('/api/tools?publisherId=' + user?.id + '&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTools(data.data.data)
        // 使用API返回的总数，而不是当前页的数量
        const total = data.data.total || data.data.data.length
        const pending = data.data.data.filter((t: Tool) => t.status === 'pending').length
        const approved = data.data.data.filter((t: Tool) => t.status === 'approved').length
        const rejected = data.data.data.filter((t: Tool) => t.status === 'rejected').length
        setStats({ total, pending, approved, rejected })
      }
    } catch (error) {
      console.error('获取工具列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个工具吗？')) return

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        fetchMyTools()
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 检查用户权限
  if (user?.role !== 'publisher' && user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">需要发布者权限</h2>
        <p className="text-muted-foreground mb-6">
          您还不是发布者，请联系管理员申请发布者权限。
        </p>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">总发布数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">待审核</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">已通过</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">已拒绝</p>
          </CardContent>
        </Card>
      </div>

      {/* Tools List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>我的工具</CardTitle>
          <Button asChild>
            <Link href="/publisher/tools/new">
              <Plus className="mr-2 h-4 w-4" />
              发布新工具
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {tools.length > 0 ? (
            <div className="space-y-4">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{tool.name}</h3>
                      <Badge
                        variant={
                          tool.status === 'approved'
                            ? 'default'
                            : tool.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {tool.status === 'approved'
                          ? '已通过'
                          : tool.status === 'pending'
                          ? '待审核'
                          : '已拒绝'}
                      </Badge>
                      {tool.is_featured && (
                        <Badge variant="outline">精选</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {tool.view_count}
                      </span>
                      <span>{formatRelativeTime(tool.created_at)}</span>
                      {tool.category && <span>{tool.category.name}</span>}
                    </div>
                    {tool.reject_reason && (
                      <p className="text-sm text-red-500 mt-1">
                        拒绝原因：{tool.reject_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/tools/${tool.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/publisher/tools/${tool.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(tool.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">您还没有发布任何工具</p>
              <Button asChild>
                <Link href="/publisher/tools/new">
                  <Plus className="mr-2 h-4 w-4" />
                  发布第一个工具
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
