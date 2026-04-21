'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Loader2, Sparkles, Wand2, Upload, Link2, PanelRightOpen, PanelRightClose } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ImageUploader from '@/components/ui/image-uploader'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { MarkdownEditorSimple } from '@/components/ui/markdown-editor'
import { ToolLogo } from '@/components/tools/ToolLogo'
import { TagInput } from '@/components/ui/tag-input'
import ToolPreview from '@/components/tools/ToolPreview'

interface Category {
  id: number
  name: string
  color?: string
}

export default function NewToolPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
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
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(true) // 默认显示预览

  // 判断是否为管理员
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchCategories()
  }, [])

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

  // AI 自动生成工具信息
  const handleGenerateInfo = async () => {
    setGenerateError('')
    
    if (!formData.name || !formData.website) {
      setGenerateError('请先填写工具名称和官网地址')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/admin/generate-tool-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          website: formData.website,
        }),
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        const result = data.data
        // 自动填充表单
        setFormData(prev => ({
          ...prev,
          name: result.name || prev.name,
          description: result.description || prev.description,
          longDescription: result.long_description || prev.longDescription,
          tags: result.tags || [],
          isFree: result.is_free ?? prev.isFree,
          pricingInfo: result.pricing_info || prev.pricingInfo,
          // 根据返回的分类名称匹配分类ID
          categoryId: result.category 
            ? categories.find(c => c.name === result.category)?.id?.toString() || prev.categoryId
            : prev.categoryId,
        }))
      } else {
        setGenerateError(data.error || '生成失败，请重试')
      }
    } catch (error) {
      setGenerateError('生成失败，请稍后重试')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.description || !formData.website || !formData.categoryId) {
      setError('请填写必要信息')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/tools', {
        method: 'POST',
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
        setError(data.error || '发布失败')
      }
    } catch (error) {
      setError('发布失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 获取当前分类的颜色
  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId)

  return (
    <div className="min-h-screen">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/publisher">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回发布中心
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">发布新工具</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              {showPreview ? (
                <>
                  <PanelRightClose className="h-4 w-4" />
                  隐藏预览
                </>
              ) : (
                <>
                  <PanelRightOpen className="h-4 w-4" />
                  显示预览
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 管理员专属：AI 自动生成区域 */}
        {isAdmin && (
          <Card className="mb-6 border-dashed border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                AI 自动生成（管理员专属）
              </CardTitle>
              <CardDescription>
                输入工具名称和链接，AI 将自动生成描述、分类、标签等信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="generate-name">工具名称</Label>
                  <Input
                    id="generate-name"
                    placeholder="例如：ChatGPT"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generate-website">官网地址</Label>
                  <Input
                    id="generate-website"
                    type="url"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
              
              {generateError && (
                <Alert variant="destructive">
                  <AlertDescription>{generateError}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="button"
                onClick={handleGenerateInfo}
                disabled={generating || !formData.name || !formData.website}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI 正在生成...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    自动生成信息
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 左右两栏布局 */}
      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* 左栏：表单区域 */}
        <Card>
          <CardHeader>
            <CardTitle>填写工具信息</CardTitle>
          </CardHeader>
          <CardContent>
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
                minHeight="400px"
              />
            </div>

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

            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                提交审核
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/publisher">取消</Link>
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>

        {/* 右栏：实时预览 */}
        {showPreview && (
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <ToolPreviewPanel formData={formData} categories={categories} />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

// 预览面板组件
function ToolPreviewPanel({ 
  formData, 
  categories 
}: { 
  formData: {
    name: string
    description: string
    longDescription: string
    website: string
    logo: string
    categoryId: string
    isFree: boolean
    pricingInfo: string
    tags: string[]
  }
  categories: { id: number; name: string; color?: string }[]
}) {
  const selectedCategory = categories.find(c => c.id.toString() === formData.categoryId)

  return (
    <div className="bg-muted/30 rounded-lg border overflow-hidden">
      <div className="bg-primary/10 px-4 py-2 border-b">
        <p className="text-sm font-medium text-primary">实时预览</p>
      </div>
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Tool Info */}
        <div className="bg-background rounded-lg border mb-4">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border bg-muted shrink-0">
                <ToolLogo
                  logo={formData.logo || null}
                  name={formData.name || '工具'}
                  website={formData.website}
                  className="w-full h-full object-cover"
                  size={56}
                  fallbackBgColor={selectedCategory?.color}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate">{formData.name || '工具名称'}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {formData.description || '工具描述将在此处显示...'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedCategory ? (
                <span 
                  className="text-xs px-2 py-1 rounded-full border"
                  style={{ borderColor: selectedCategory.color, color: selectedCategory.color }}
                >
                  {selectedCategory.name}
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full border border-muted text-muted-foreground">
                  未选择分类
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${formData.isFree ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-secondary'}`}>
                {formData.isFree ? '免费' : '付费'}
              </span>
            </div>
          </div>
        </div>

        {/* Long Description */}
        {formData.longDescription && (
          <div className="bg-background rounded-lg border mb-4">
            <div className="px-4 py-3 border-b">
              <h3 className="font-medium text-sm">详细介绍</h3>
            </div>
            <div className="p-4">
              <div 
                className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none line-clamp-6" 
                dangerouslySetInnerHTML={{ __html: formData.longDescription }} 
              />
            </div>
          </div>
        )}

        {/* Pricing Info */}
        {formData.pricingInfo && (
          <div className="bg-background rounded-lg border mb-4">
            <div className="px-4 py-3 border-b">
              <h3 className="font-medium text-sm">💰 定价信息</h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.pricingInfo}</p>
            </div>
          </div>
        )}

        {/* Tags */}
        {formData.tags && formData.tags.length > 0 && (
          <div className="bg-background rounded-lg border">
            <div className="px-4 py-3 border-b">
              <h3 className="font-medium text-sm">标签</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
