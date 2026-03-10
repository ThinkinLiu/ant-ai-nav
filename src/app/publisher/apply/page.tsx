'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, Send, CheckCircle, Clock, XCircle, 
  Loader2, FileText, Globe, Mail, User
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/lib/utils'

interface Application {
  id: number
  status: string
  reason: string
  contact: string | null
  website: string | null
  created_at: string
  reviewed_at: string | null
  review_note: string | null
}

export default function ApplyPublisherPage() {
  const router = useRouter()
  const { user, token, isLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [directMode, setDirectMode] = useState(false)
  
  // 表单数据
  const [reason, setReason] = useState('')
  const [contact, setContact] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/publisher/apply')
    } else if (user && token) {
      // 检查是否已经是发布者
      if (user.role === 'publisher' || user.role === 'admin') {
        router.push('/publisher')
        return
      }
      fetchApplicationStatus()
    }
  }, [user, isLoading, token])

  const fetchApplicationStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/apply-publisher', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        if (data.data.status === 'direct') {
          setDirectMode(true)
        } else if (data.data.status !== 'none') {
          setApplication(data.data)
        }
      }
    } catch (err) {
      console.error('获取申请状态失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim() || reason.trim().length < 10) {
      setError('请填写申请理由（至少10个字符）')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/user/apply-publisher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: reason.trim(),
          contact: contact.trim() || null,
          website: website.trim() || null,
        }),
      })

      const data = await response.json()
      if (data.success) {
        if (data.data?.directUpgrade) {
          // 直接升级成功，跳转到发布者中心
          router.push('/publisher')
        } else {
          // 申请已提交
          setApplication(data.data)
        }
      } else {
        setError(data.error || '提交失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // 已有申请记录
  if (application && application.status !== 'none') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回个人中心
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                申请状态
              </CardTitle>
              <CardDescription>
                提交时间：{formatRelativeTime(application.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {application.status === 'pending' && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    您的申请正在审核中，请耐心等待
                  </AlertDescription>
                </Alert>
              )}

              {application.status === 'approved' && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    恭喜！您的申请已通过，现在可以发布AI工具了
                  </AlertDescription>
                </Alert>
              )}

              {application.status === 'rejected' && (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    很抱歉，您的申请未通过审核
                    {application.review_note && (
                      <p className="mt-2">原因：{application.review_note}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">申请理由</Label>
                  <p className="mt-1">{application.reason}</p>
                </div>
                {application.contact && (
                  <div>
                    <Label className="text-muted-foreground">联系方式</Label>
                    <p className="mt-1">{application.contact}</p>
                  </div>
                )}
                {application.website && (
                  <div>
                    <Label className="text-muted-foreground">个人网站</Label>
                    <a 
                      href={application.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-primary hover:underline block"
                    >
                      {application.website}
                    </a>
                  </div>
                )}
              </div>

              {application.status === 'approved' && (
                <Button asChild className="w-full">
                  <Link href="/publisher">前往发布者中心</Link>
                </Button>
              )}

              {application.status === 'rejected' && (
                <Button asChild className="w-full" variant="outline">
                  <Link href="/publisher/apply">重新申请</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 申请表单
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回个人中心
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              申请成为发布者
            </CardTitle>
            <CardDescription>
              成为发布者后，您可以发布和管理AI工具
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 权益说明 */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-3">发布者权益</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  发布AI工具到平台
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  管理已发布的工具
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  查看工具数据统计
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  编辑和更新工具信息
                </li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 申请理由 */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  申请理由 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="请说明您为什么想成为发布者，以及您计划发布什么类型的AI工具..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  至少10个字符，建议详细描述您的发布计划
                </p>
              </div>

              {/* 联系方式 */}
              <div className="space-y-2">
                <Label htmlFor="contact">
                  联系方式（选填）
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact"
                    type="text"
                    placeholder="邮箱、微信或其他联系方式"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 个人网站 */}
              <div className="space-y-2">
                <Label htmlFor="website">
                  个人网站（选填）
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || reason.trim().length < 10}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      提交申请
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
