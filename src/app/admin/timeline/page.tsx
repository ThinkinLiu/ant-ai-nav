'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'

const categoryConfig = {
  breakthrough: { label: '技术突破', icon: '💡' },
  product: { label: '产品发布', icon: '🚀' },
  research: { label: '学术研究', icon: '🔬' },
  organization: { label: '组织事件', icon: '🏢' },
  other: { label: '其他', icon: '📌' },
}

const importanceConfig = {
  landmark: { label: '里程碑', color: 'bg-yellow-500' },
  important: { label: '重要事件', color: 'bg-blue-500' },
  normal: { label: '普通事件', color: 'bg-gray-500' },
}

export default function TimelineManagementPage() {
  const router = useRouter()
  const { confirm, ConfirmDialog } = useConfirm()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    category: '',
    importance: '',
    search: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [page, filters])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.category && { category: filters.category }),
        ...(filters.importance && { importance: filters.importance }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/timeline?${params}`)
      const result = await response.json()

      if (result.success) {
        setEvents(result.data.data)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('获取大事纪列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: '删除确认',
      description: '确定要删除这个事件吗？此操作不可撤销。',
      confirmText: '删除',
      destructive: true,
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/timeline/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('删除成功')
        fetchEvents()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI大事纪管理</CardTitle>
            <Button asChild>
              <Link href="/admin/timeline/new">
                <Plus className="mr-2 h-4 w-4" />
                新增事件
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
                  placeholder="搜索标题或描述..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {Object.entries(categoryConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.icon} {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.importance}
              onValueChange={(value) => setFilters({ ...filters, importance: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="重要性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {Object.entries(importanceConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>年份</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>重要性</TableHead>
                <TableHead>浏览</TableHead>
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
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.year}
                      {event.month && `.${event.month}`}
                      {event.day && `.${event.day}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        {event.title_en && (
                          <div className="text-sm text-muted-foreground">{event.title_en}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.category && categoryConfig[event.category as keyof typeof categoryConfig] && (
                        <span>
                          {categoryConfig[event.category as keyof typeof categoryConfig].icon}{' '}
                          {categoryConfig[event.category as keyof typeof categoryConfig].label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {event.importance && importanceConfig[event.importance as keyof typeof importanceConfig] && (
                        <Badge className={importanceConfig[event.importance as keyof typeof importanceConfig].color}>
                          {importanceConfig[event.importance as keyof typeof importanceConfig].label}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{event.view_count || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/timeline/${event.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(event.id)}
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
