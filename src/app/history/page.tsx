'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Clock, Loader2, ChevronLeft, ChevronRight, Trash2, ExternalLink } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { ToolLogoNext } from '@/components/tools/ToolLogo'
import { toast } from 'sonner'

interface Category {
  id: number
  name: string
  slug: string
  color: string | null
}

interface Tool {
  id: number
  name: string
  description: string
  website: string
  logo: string | null
  is_free: boolean
  category_id: number
  category: Category | null
}

interface HistoryItem {
  id: number
  created_at: string
  tool: Tool | null
}

interface ApiResponse {
  success: boolean
  data: {
    history: HistoryItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export default function HistoryPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: HistoryItem | null }>({
    open: false,
    item: null
  })
  const [clearAllDialog, setClearAllDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const limit = 24

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/history')
      return
    }
  }, [user, router])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (user && token) {
      fetchHistory()
    }
  }, [user, token, page, selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    }
  }

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/history?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ApiResponse = await response.json()
      if (data.success) {
        // 分类筛选
        let filteredHistory = data.data.history
        if (selectedCategory !== 'all') {
          filteredHistory = data.data.history.filter(
            item => item.tool?.category_id.toString() === selectedCategory
          )
        }
        setHistory(filteredHistory)
        // 如果筛选后结果为空，且不是第一页，回归第一页
        if (filteredHistory.length === 0 && page > 1) {
          setPage(1)
        }
        setTotal(selectedCategory === 'all' ? data.data.total : filteredHistory.length)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error('获取浏览历史失败:', error)
      toast.error('获取浏览历史失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.item || !token) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/history?id=${deleteDialog.item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        setDeleteDialog({ open: false, item: null })
        fetchHistory()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      toast.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleClearAll = async () => {
    if (!token) return
    
    setClearing(true)
    try {
      const response = await fetch(`/api/history`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        toast.success('浏览历史已清空')
        setClearAllDialog(false)
        setHistory([])
        setTotal(0)
      } else {
        toast.error(data.error || '清空失败')
      }
    } catch (error) {
      toast.error('清空失败')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="mr-1 h-4 w-4" />
              返回首页
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">浏览历史</span>
          </div>
          <div className="w-[100px]">
            {total > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setClearAllDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清空
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 筛选器 */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    {category.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="text-sm text-muted-foreground">
            共 {total} 条记录
          </span>
        </div>

        {/* 历史列表 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无浏览历史</h3>
              <p className="text-muted-foreground mb-4">快去浏览感兴趣的 AI 工具吧</p>
              <Button asChild>
                <Link href="/tools">浏览工具</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((item) => (
              <Card key={item.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <ToolLogoNext 
                      logo={item.tool?.logo || null}
                      name={item.tool?.name || ''}
                      website={item.tool?.website || ''}
                      size={48}
                      className="h-12 w-12 rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/tools/${item.tool?.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.tool?.name}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {item.tool?.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {item.tool?.category && (
                          <Badge 
                            variant="outline"
                            className="text-xs"
                            style={{ 
                              borderColor: item.tool.category.color || undefined,
                              color: item.tool.category.color || undefined
                            }}
                          >
                            {item.tool.category.name}
                          </Badge>
                        )}
                        {item.tool?.is_free && (
                          <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            免费
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.created_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        asChild
                      >
                        <a href={item.tool?.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setDeleteDialog({ open: true, item })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              首页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 text-sm">
              第 {page} / {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              末页
            </Button>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, item: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这条浏览历史吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, item: null })}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '删除中...' : '删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 清空全部确认对话框 */}
      <Dialog open={clearAllDialog} onOpenChange={setClearAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认清空</DialogTitle>
            <DialogDescription>
              确定要清空所有浏览历史吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearAllDialog(false)}>
              取消
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearAll}
              disabled={clearing}
            >
              {clearing ? '清空中...' : '清空全部'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
