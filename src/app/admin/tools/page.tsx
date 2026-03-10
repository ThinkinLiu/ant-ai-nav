'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRelativeTime } from '@/lib/utils'
import { Check, X, Eye, ExternalLink } from 'lucide-react'

interface Tool {
  id: number
  name: string
  description: string
  website: string
  status: string
  created_at: string
  publisher: { name: string; email: string } | null
  category: { name: string } | null
}

export default function AdminToolsPage() {
  const { token } = useAuth()
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; toolId: number | null }>({
    open: false,
    toolId: null,
  })
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchTools()
  }, [activeTab])

  const fetchTools = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tools?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTools(data.data.data)
      }
    } catch (error) {
      console.error('获取工具列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      })
      const data = await response.json()
      if (data.success) {
        fetchTools()
      }
    } catch (error) {
      console.error('审核失败:', error)
    }
  }

  const handleReject = async () => {
    if (!rejectDialog.toolId) return

    try {
      const response = await fetch(`/api/tools/${rejectDialog.toolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'rejected', rejectReason }),
      })
      const data = await response.json()
      if (data.success) {
        setRejectDialog({ open: false, toolId: null })
        setRejectReason('')
        fetchTools()
      }
    } catch (error) {
      console.error('拒绝失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>工具审核</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                待审核
              </TabsTrigger>
              <TabsTrigger value="approved">
                已通过
              </TabsTrigger>
              <TabsTrigger value="rejected">
                已拒绝
              </TabsTrigger>
              <TabsTrigger value="">
                全部
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
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
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {tool.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>发布者：{tool.publisher?.name || '未知'}</span>
                        <span>{tool.category?.name || '未分类'}</span>
                        <span>{formatRelativeTime(tool.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={tool.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/tools/${tool.id}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      {tool.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(tool.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            通过
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectDialog({ open: true, toolId: tool.id })}
                          >
                            <X className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {tools.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">暂无数据</p>
                )}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, toolId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝理由</DialogTitle>
            <DialogDescription>
              请填写拒绝该工具的理由，将反馈给发布者。
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="请输入拒绝理由..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, toolId: null })}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
