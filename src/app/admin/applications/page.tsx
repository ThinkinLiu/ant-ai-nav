'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  UserCheck, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, Check, X,
  Clock, ExternalLink, Eye
} from 'lucide-react'

interface Application {
  id: number
  user_id: string
  reason: string
  contact: string | null
  website: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  created_at: string
  user: {
    id: string
    name: string | null
    email: string
    avatar: string | null
    created_at: string
  } | null
  reviewer: {
    id: string
    name: string | null
  } | null
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function AdminApplicationsPage() {
  const { token } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // 审核弹窗
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean
    application: Application | null
    action: 'approve' | 'reject' | null
  }>({ open: false, application: null, action: null })
  const [reviewNote, setReviewNote] = useState('')
  const [processing, setProcessing] = useState(false)

  // 详情弹窗
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean
    application: Application | null
  }>({ open: false, application: null })

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString()
      })
      
      if (filter !== 'all') {
        params.append('status', filter)
      }
      
      const response = await fetch(`/api/admin/applications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setApplications(data.data.data)
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total,
          totalPages: data.data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('获取申请列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [token, pagination.page, pagination.pageSize, filter])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleReview = async () => {
    if (!reviewDialog.application || !reviewDialog.action) return
    
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: reviewDialog.application.id,
          action: reviewDialog.action,
          reviewNote: reviewNote.trim() || null
        })
      })
      const data = await response.json()
      if (data.success) {
        setApplications(prev => prev.filter(a => a.id !== reviewDialog.application?.id))
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.pageSize)
        }))
        setReviewDialog({ open: false, application: null, action: null })
        setReviewNote('')
      }
    } catch (error) {
      console.error('审核失败:', error)
    } finally {
      setProcessing(false)
    }
  }

  const openReviewDialog = (application: Application, action: 'approve' | 'reject') => {
    setReviewDialog({ open: true, application, action })
    setReviewNote('')
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: string) => {
    setPagination(prev => ({ ...prev, page: 1, pageSize: parseInt(size) }))
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />待审核</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Check className="h-3 w-3 mr-1" />已通过</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><X className="h-3 w-3 mr-1" />已拒绝</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            发布者申请审核
            <Badge variant="secondary">{pagination.total} 条</Badge>
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="approved">已通过</SelectItem>
                <SelectItem value="rejected">已拒绝</SelectItem>
                <SelectItem value="all">全部</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{filter === 'pending' ? '暂无待审核的申请' : '暂无申请记录'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={app.user?.avatar || undefined} />
                        <AvatarFallback>
                          {app.user?.name?.[0] || app.user?.email?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{app.user?.name || '未知用户'}</span>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{app.user?.email}</p>
                        <p className="text-sm line-clamp-2 mb-2">
                          <span className="font-medium text-foreground">申请理由：</span>
                          {app.reason}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>申请时间：{formatRelativeTime(app.created_at)}</span>
                          {app.contact && <span>联系方式：{app.contact}</span>}
                          {app.website && (
                            <a 
                              href={app.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                              个人网站
                            </a>
                          )}
                        </div>
                        {app.status !== 'pending' && app.reviewer && (
                          <p className="text-xs text-muted-foreground mt-2">
                            审核人：{app.reviewer.name} | 审核时间：{formatRelativeTime(app.reviewed_at!)}
                            {app.review_note && <span className="ml-2">备注：{app.review_note}</span>}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailDialog({ open: true, application: app })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {app.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => openReviewDialog(app, 'approve')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            通过
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => openReviewDialog(app, 'reject')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                共 {pagination.total} 条申请，第 {pagination.page} / {pagination.totalPages} 页
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

      {/* 审核确认弹窗 */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, application: null, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approve' ? '确认通过申请' : '确认拒绝申请'}
            </DialogTitle>
            <DialogDescription>
              {reviewDialog.action === 'approve' 
                ? '通过后，该用户将成为发布者，可以发布和管理AI工具。'
                : '拒绝后，用户可以重新提交申请。'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">申请人：{reviewDialog.application?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{reviewDialog.application?.user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">审核备注（可选）</label>
              <Textarea
                placeholder={reviewDialog.action === 'approve' 
                  ? '可以给申请者一些建议或鼓励...' 
                  : '请说明拒绝原因，帮助用户改进...'
                }
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog({ open: false, application: null, action: null })}>
              取消
            </Button>
            <Button 
              variant={reviewDialog.action === 'approve' ? 'default' : 'destructive'}
              onClick={handleReview} 
              disabled={processing}
            >
              {processing ? '处理中...' : (reviewDialog.action === 'approve' ? '确认通过' : '确认拒绝')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ open, application: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>申请详情</DialogTitle>
          </DialogHeader>
          {detailDialog.application && (
            <div className="space-y-4">
              {/* 申请人信息 */}
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={detailDialog.application.user?.avatar || undefined} />
                  <AvatarFallback>
                    {detailDialog.application.user?.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{detailDialog.application.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{detailDialog.application.user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    注册时间：{formatRelativeTime(detailDialog.application.user?.created_at || '')}
                  </p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(detailDialog.application.status)}
                </div>
              </div>

              {/* 申请信息 */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">申请理由</label>
                  <p className="mt-1 text-sm bg-background border rounded-lg p-3">
                    {detailDialog.application.reason}
                  </p>
                </div>
                
                {detailDialog.application.contact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">联系方式</label>
                    <p className="mt-1 text-sm">{detailDialog.application.contact}</p>
                  </div>
                )}
                
                {detailDialog.application.website && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">个人网站</label>
                    <a 
                      href={detailDialog.application.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {detailDialog.application.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    申请时间：{new Date(detailDialog.application.created_at).toLocaleString('zh-CN')}
                  </p>
                </div>

                {/* 审核结果 */}
                {detailDialog.application.status !== 'pending' && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">审核结果</h4>
                    <div className="bg-muted p-3 rounded-lg space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">审核人：</span>
                        {detailDialog.application.reviewer?.name}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">审核时间：</span>
                        {new Date(detailDialog.application.reviewed_at!).toLocaleString('zh-CN')}
                      </p>
                      {detailDialog.application.review_note && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">审核备注：</span>
                          {detailDialog.application.review_note}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              {detailDialog.application.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setDetailDialog({ open: false, application: null })
                      openReviewDialog(detailDialog.application!, 'reject')
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    拒绝
                  </Button>
                  <Button
                    onClick={() => {
                      setDetailDialog({ open: false, application: null })
                      openReviewDialog(detailDialog.application!, 'approve')
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    通过
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
