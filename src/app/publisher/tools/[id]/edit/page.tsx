'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Loader2, AlertCircle, Upload, Link2 } from 'lucide-react'
import ImageUploader from '@/components/ui/image-uploader'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { MarkdownEditorSimple } from '@/components/ui/markdown-editor'
import { ToolLogo } from '@/components/tools/ToolLogo'
import { TagInput } from '@/components/ui/tag-input'

interface Category {
  id: number
  name: string
  color?: string
}

interface Tool {
  id: number
  name: string
  slug: string
  description: string
  long_description: string | null
  website: string
  logo: string | null
  category_id: number
  is_free: boolean
  pricing_info: string | null
  status: string
  reject_reason: string | null
  category: Category | null
  tags: { id: number; name: string; slug: string }[]
}

export default function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, token } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [logoInputMode, setLogoInputMode] = useState<string>('upload')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    website: '',
    logo: '',
    categoryId: '',
    isFree: true,
    pricingInfo: '',
    tags: [] as string[],
  })

  useEffect(() => {
    if (user && token) {
      fetchTool()
      fetchCategories()
    }
  }, [user, token])

  const fetchTool = async () => {
    try {
      const response = await fetch(`/api/tools/${resolvedParams.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        const toolData = data.data
        setTool(toolData)
        setFormData({
          name: toolData.name || '',
          description: toolData.description || '',
          longDescription: toolData.long_description || '',
          website: toolData.website || '',
          logo: toolData.logo || '',
          categoryId: toolData.category_id?.toString() || '',
          isFree: toolData.is_free ?? true,
          pricingInfo: toolData.pricing_info || '',
          tags: toolData.tags?.map((t: any) => t.name) || [],
        })
        // 如果已有logo，根据是否为URL判断模式
        if (toolData.logo) {
          setLogoInputMode('url')
        }
      } else {
        setError('工具不存在')
      }
    } catch (error) {
      console.error('获取工具失败:', error)
      setError('获取工具失败')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.description || !formData.website || !formData.categoryId) {
      setError('请填写必要信息')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/tools/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.filter(Boolean),
        }),
      })
      const data = await response.json()
      if (data.success) {
        router.push('/publisher')
      } else {
        setError(data.error || '更新失败')
      }
    } catch (error) {
      setError('更新失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">工具不存在或无权限编辑</p>
        <Button asChild>
          <Link href="/publisher">返回发布者中心</Link>
        </Button>
      </div>
    )
  }

  // 获取当前分类的颜色
  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId)

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/publisher">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            编辑工具
            {tool.status === 'approved' && (
              <Badge variant="default" className="text-xs">已通过</Badge>
            )}
            {tool.status === 'pending' && (
              <Badge variant="secondary" className="text-xs">待审核</Badge>
            )}
            {tool.status === 'rejected' && (
              <Badge variant="destructive" className="text-xs">已拒绝</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 提示信息 */}
          {tool.status === 'approved' && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">编辑后需要重新审核</p>
                  <p className="mt-1">修改工具信息后，状态将变为"待审核"，需要管理员重新审批通过后才会显示在平台上。</p>
                </div>
              </div>
            </div>
          )}

          {tool.status === 'rejected' && tool.reject_reason && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">拒绝原因：{tool.reject_reason}</p>
                  <p className="mt-1">请根据拒绝原因修改后重新提交。</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">工具名称 *</Label>
              <Input
                id="name"
                placeholder="例如：ChatGPT"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">官网地址 *</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://..."
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">分类 *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">简短描述 *</Label>
              <Input
                id="description"
                placeholder="一句话介绍这个工具"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">详细介绍</Label>
              <p className="text-xs text-muted-foreground">
                支持富文本编辑，可从微信、百度等网站直接复制图文粘贴
              </p>
              <RichTextEditor
                value={formData.longDescription}
                onChange={(value) => setFormData({ ...formData, longDescription: value })}
                placeholder="详细介绍这个工具的功能、特点、使用场景等..."
                minHeight={200}
              />
            </div>

            {/* Logo 上传/URL 输入 */}
            {/* Logo 上传/URL 输入 */}
            <div className="space-y-3">
              <Label>工具图标</Label>
              
              {/* 图标预览 */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 bg-muted">
                  <ToolLogo
                    logo={formData.logo || null}
                    name={formData.name || '工具'}
                    website={formData.website}
                    className="w-full h-full object-cover"
                    size={64}
                    fallbackBgColor={selectedCategory?.color}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>图标预览（与首页显示一致）</p>
                  <p className="text-xs">为空时自动使用网站图标服务生成</p>
                </div>
              </div>

              {/* 输入方式切换 */}
              <Tabs value={logoInputMode} onValueChange={setLogoInputMode}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    上传图片
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    输入 URL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="mt-4">
                  <ImageUploader
                    value={formData.logo}
                    onChange={(url) => setFormData({ ...formData, logo: url })}
                    folder="logos"
                    aspectRatio="square"
                    maxSize={2}
                    placeholder="点击上传图标"
                  />
                </TabsContent>
                
                <TabsContent value="url" className="mt-4">
                  <Input
                    id="logo"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    输入图标的完整 URL 地址
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <TagInput
                value={formData.tags}
                onChange={(tags: string[]) => setFormData({ ...formData, tags })}
                placeholder="输入标签，按回车或逗号分隔"
                maxTags={10}
              />
              <p className="text-xs text-muted-foreground">
                输入标签后按回车或输入逗号（中英文皆可）自动分隔，最多添加 10 个标签
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isFree">免费使用</Label>
              <Switch
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingInfo">定价信息</Label>
              <p className="text-xs text-muted-foreground">
                支持富文本编辑，可从微信、百度等网站直接复制图文粘贴
              </p>
              <MarkdownEditorSimple
                value={formData.pricingInfo}
                onChange={(value) => setFormData({ ...formData, pricingInfo: value || '' })}
                placeholder={
                  formData.isFree
                    ? "描述免费情况，如：完全免费、部分功能免费等"
                    : "描述定价方案，如：免费版、专业版$20/月"
                }
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存并提交审核
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/publisher">取消</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
