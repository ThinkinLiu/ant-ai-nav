'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const statusConfig = {
  draft: { label: '草稿', color: 'bg-gray-500' },
  pending: { label: '待审核', color: 'bg-yellow-500' },
  approved: { label: '已发布', color: 'bg-green-500' },
  rejected: { label: '已拒绝', color: 'bg-red-500' },
}

const categoryConfig = {
  industry: '行业动态',
  research: '学术研究',
  product: '产品发布',
  tutorial: '教程指南',
  other: '其他',
}

export default function NewsManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  })

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'publisher')) {
      fetchNews()
    }
  }, [user, page, filters])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
        ...(user?.role === 'publisher' && { authorId: user.id }),
      })

      const response = await fetch(`/api/news?${params}`)
      const result = await response.json()

      if (result.success) {
        setNews(result.data.data)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('获取资讯列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条资讯吗？')) return

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchNews()
      } else {
        alert(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  const handleReview = async (id: number, status: 'approved' | 'rejected', reason?: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/news/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewedBy: user.id,
          rejectReason: reason,
        }),
      })

      const result = await response.json()

      if (result.success) {
        fetchNews()
      } else {
        alert(result.error || '审核失败')
      }
    } catch (error) {
      console.error('审核失败:', error)
      alert('审核失败')
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'publisher')) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI资讯管理</CardTitle>
            <Button asChild>
              <Link href="/admin/news/new">
                <Plus className="mr-2 h-4 w-4" />
                新建资讯
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选器 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索标题或摘要..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(statusConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {Object.entries(categoryConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>浏览</TableHead>
                <TableHead>发布时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      {item.category && categoryConfig[item.category as keyof typeof categoryConfig]}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[item.status as keyof typeof statusConfig]?.color}>
                        {statusConfig[item.status as keyof typeof statusConfig]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.view_count || 0}</TableCell>
                    <TableCell>
                      {item.published_at
                        ? format(new Date(item.published_at), 'yyyy-MM-dd', { locale: zhCN })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'admin' && item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReview(item.id, 'approved')}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = prompt('请输入拒绝原因：')
                                if (reason) handleReview(item.id, 'rejected', reason)
                              }}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/news/${item.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span className="py-2 px-4">
                第 {page} / {Math.ceil(total / 20)} 页
              </span>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
