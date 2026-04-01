'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatRelativeTime } from '@/lib/utils'
import { 
  MessageCircle, Trash2, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, Star, ExternalLink,
  Search, Eye, X, Award
} from 'lucide-react'

interface Comment {
  id: number
  content: string
  rating: number | null
  created_at: string
  reply_count: number
  is_featured: boolean
  user: {
    id: string
    name: string | null
    avatar: string | null
  } | null
  tool: {
    id: number
    name: string
  } | null
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export default function AdminCommentsPage() {
  const { token } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  
  // 搜索相关
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  
  // 删除确认弹窗
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    comment: Comment | null
  }>({ open: false, comment: null })
  const [deleting, setDeleting] = useState(false)

  // 预览弹窗
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean
    comment: Comment | null
  }>({ open: false, comment: null })

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString()
      })
      
      if (keyword) {
        params.append('keyword', keyword)
      }
      
      const response = await fetch(`/api/admin/comments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setComments(data.data.data)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('获取评论列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [token, pagination.page, pagination.pageSize, keyword])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSearch = () => {
    setKeyword(searchInput)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setKeyword('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.comment) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/comments/${deleteDialog.comment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== deleteDialog.comment?.id))
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.pageSize)
        }))
        setDeleteDialog({ open: false, comment: null })
      }
    } catch (error) {
      console.error('删除评论失败:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleFeatured = async (comment: Comment) => {
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          isFeatured: !comment.is_featured 
        }),
      })
      const data = await response.json()
      if (data.success) {
        setComments(prev => prev.map(c => 
          c.id === comment.id 
            ? { ...c, is_featured: !c.is_featured }
            : c
        ))
      }
    } catch (error) {
      console.error('精选操作失败:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: string) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize: parseInt(size) }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            评论管理
            <Badge variant="secondary">{pagination.total} 条</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* 搜索框 */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input
                  placeholder="搜索评论内容/用户名..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-64 pr-8"
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={handleClearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Button onClick={handleSearch} size="default">
                <Search className="h-4 w-4 mr-1" />
                搜索
              </Button>
            </div>
            <div className="h-6 w-px bg-border" />
            <span className="text-sm text-muted-foreground">每页</span>
            <Select value={pagination.pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索状态提示 */}
          {keyword && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>搜索关键词：</span>
              <Badge variant="secondary">{keyword}</Badge>
              <span>找到 {pagination.total} 条结果</span>
              <Button variant="ghost" size="sm" onClick={handleClearSearch}>
                清除搜索
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{keyword ? '未找到匹配的评论' : '暂无评论'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.user?.avatar || undefined} />
                      <AvatarFallback>
                        {comment.user?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.user?.name || '未知用户'}</span>
                        {comment.is_featured && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <Award className="h-3 w-3 mr-1" />
                            精选
                          </Badge>
                        )}
                        {comment.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-yellow-600">{comment.rating}</span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {comment.reply_count} 回复
                        </span>
                        {comment.tool && (
                          <Link 
                            href={`/tools/${comment.tool.id}`}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {comment.tool.name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant={comment.is_featured ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleToggleFeatured(comment)}
                      title={comment.is_featured ? "取消精选" : "设为精选"}
                    >
                      <Award className={`h-4 w-4 mr-1 ${comment.is_featured ? 'text-amber-600' : ''}`} />
                      {comment.is_featured ? '取消精选' : '精选'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewDialog({ open: true, comment })}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteDialog({ open: true, comment })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                共 {pagination.total} 条评论，第 {pagination.page} / {pagination.totalPages} 页
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-sm">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, comment: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这条评论吗？此操作不可撤销，评论的所有回复也会被删除。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm bg-muted p-3 rounded-lg">
              {deleteDialog.comment?.content}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, comment: null })}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 预览弹窗 */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog({ open, comment: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>评论详情</DialogTitle>
          </DialogHeader>
          {(() => {
            const comment = previewDialog.comment
            if (!comment) return null
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={comment.user?.avatar || undefined} />
                    <AvatarFallback>
                      {comment.user?.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment.user?.name || '未知用户'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.created_at)}
                    </p>
                  </div>
                  {comment.rating && (
                    <div className="flex items-center gap-1 ml-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < comment.rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
                {comment.tool && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      评论工具：{comment.tool.name}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tools/${comment.tool.id}`}>
                        查看工具
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
