'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Link2, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Mail, 
  User,
  Copy,
  Loader2,
  ExternalLink
} from 'lucide-react'

export default function LinkSubmitClient() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    logo: '',
    contactName: '',
    contactEmail: '',
  })

  // 本站信息（用于复制）
  const siteInfo = {
    name: '蚂蚁AI导航',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
    logo: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '',
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label}已复制`)
    }).catch(() => {
      toast.error('复制失败，请手动复制')
    })
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error('请填写网站名称和网址')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/friend-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          url: formData.url,
          description: formData.description,
          logo: formData.logo,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message)
        // 重置表单
        setFormData({
          name: '',
          url: '',
          description: '',
          logo: '',
          contactName: '',
          contactEmail: '',
        })
      } else {
        toast.error(result.error || '提交失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      toast.error('提交失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3">申请友情链接</h1>
        <p className="text-muted-foreground">
          与蚂蚁AI导航建立友链合作，共同促进AI生态发展
        </p>
      </div>

      {/* 温馨提示 */}
      <Card className="mb-8 border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">温馨提示</h3>
              <p className="text-sm text-amber-800">
                在提交申请前，<strong>请确保您已在本网站添加了友链</strong>。这是双方互惠合作的基础，感谢您的理解与配合！
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 本站信息 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            本站信息
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            请将以下信息添加到您的网站友链中
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">网站名称：</span>
                <span className="font-medium ml-2">{siteInfo.name}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(siteInfo.name, '网站名称')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">网站地址：</span>
                <span className="font-medium ml-2">{siteInfo.url || 'https://your-domain.com'}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(siteInfo.url, '网站地址')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">网站描述：</span>
                <p className="text-sm mt-1">{siteInfo.description}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(siteInfo.description, '网站描述')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">网站Logo：</span>
                <span className="text-sm ml-2">{siteInfo.logo || '/logo.png'}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(siteInfo.logo, '网站Logo')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 收录要求 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            收录要求
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-600 font-medium">1</span>
              </div>
              <span className="text-sm">网站内容需与<strong>AI、科技、互联网</strong>相关，具有一定的内容质量</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-600 font-medium">2</span>
              </div>
              <span className="text-sm">网站需正常运营，<strong>无违法违规内容</strong>，无恶意弹窗广告</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-600 font-medium">3</span>
              </div>
              <span className="text-sm">网站需有<strong>独立域名</strong>，支持HTTPS访问</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-green-600 font-medium">4</span>
              </div>
              <span className="text-sm"><strong>请先添加本站友链后再申请</strong>，审核时会检查友链情况</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 审核说明 */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">审核说明</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 提交后我们将在<strong>1-3个工作日</strong>内审核</li>
                <li>• 审核结果将通过邮件通知（如填写了邮箱）</li>
                <li>• 审核通过后，您的网站将显示在本站页脚</li>
                <li>• 如有疑问，请联系管理员</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 提交表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            提交申请
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  网站名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：AI工具导航"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="url">
                  网站地址 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">网站描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要介绍您的网站内容（选填）"
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="logo">网站Logo URL</Label>
              <div className="flex gap-2">
                <Input
                  id="logo"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png（选填）"
                  type="url"
                />
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Logo预览"
                    className="w-10 h-10 rounded border object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">
                  <User className="h-4 w-4 inline mr-1" />
                  联系人
                </Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="您的称呼（选填）"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">
                  <Mail className="h-4 w-4 inline mr-1" />
                  联系邮箱
                </Label>
                <Input
                  id="contactEmail"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="用于接收审核结果（选填）"
                  type="email"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                返回
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    提交申请
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
