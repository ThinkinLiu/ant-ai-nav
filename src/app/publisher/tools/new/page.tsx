'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Loader2, Sparkles, Wand2, Upload, Link2, Eye } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ImageUploader from '@/components/ui/image-uploader'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { MarkdownEditorSimple } from '@/components/ui/markdown-editor'
import { ToolLogo } from '@/components/tools/ToolLogo'
import { TagInput } from '@/components/ui/tag-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

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
          <span className="text-sm font-medium">发布新工具</span>
          <div className="w-[120px]" /> {/* 占位，保持标题居中 */}
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

        {/* 左右两栏布局：左侧详细介绍，右侧其他字段 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左栏：详细介绍 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>详细介绍</CardTitle>
                <CardDescription>
                  支持富文本编辑，可从微信、百度等网站直接复制图文粘贴
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={formData.longDescription}
                  onChange={(value) => setFormData({ ...formData, longDescription: value })}
                  placeholder="详细介绍这个工具的功能、特点、使用场景等..."
                  minHeight="400px"
                />
              </CardContent>
            </Card>
          </div>

          {/* 右栏：其他字段 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
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
                        <p>图标预览</p>
                        <p className="text-xs">为空时自动使用网站图标服务生成</p>
                      </div>
                    </div>

                    {/* 输入方式切换 */}
                    <Tabs value={logoInputMode} onValueChange={setLogoInputMode}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          上传
                        </TabsTrigger>
                        <TabsTrigger value="url" className="flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          URL
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

                  {/* 操作按钮 */}
                  <div className="space-y-3 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          disabled={!formData.name && !formData.description && !formData.longDescription}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          预览
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="text-xl">工具预览</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4">
                          <ToolPreviewContent formData={formData} selectedCategory={selectedCategory} />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      提交审核
                    </Button>
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <Link href="/publisher">取消</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// 工具预览内容组件
function ToolPreviewContent({ 
  formData, 
  selectedCategory 
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
  selectedCategory?: { id: number; name: string; color?: string }
}) {
  return (
    <div className="space-y-6">
      {/* 工具信息卡片 */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 bg-muted shrink-0">
              <ToolLogo
                logo={formData.logo || null}
                name={formData.name || '工具'}
                website={formData.website}
                className="w-full h-full object-cover"
                size={80}
                fallbackBgColor={selectedCategory?.color}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-2xl mb-2">{formData.name || '工具名称'}</h2>
              <p className="text-muted-foreground mb-3">
                {formData.description || '工具描述将在此处显示...'}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategory ? (
                  <span 
                    className="text-xs px-2.5 py-1 rounded-full border"
                    style={{ borderColor: selectedCategory.color, color: selectedCategory.color }}
                  >
                    {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-muted text-muted-foreground">
                    未选择分类
                  </span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full ${formData.isFree ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-secondary'}`}>
                  {formData.isFree ? '免费' : '付费'}
                </span>
              </div>
            </div>
          </div>
          
          {/* 官网链接 */}
          {formData.website && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={formData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <span>访问官网</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 标签 */}
      {formData.tags && formData.tags.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium text-sm mb-3">标签</h3>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="text-xs px-2.5 py-1 rounded-full bg-secondary">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 定价信息 */}
      {formData.pricingInfo && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium text-sm mb-2">💰 定价信息</h3>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
            {formData.pricingInfo}
          </div>
        </div>
      )}

      {/* 详细介绍 */}
      {formData.longDescription && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-medium text-sm mb-3">详细介绍</h3>
          <div 
            className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: formData.longDescription }} 
          />
        </div>
      )}
    </div>
  )
}

// 需要引入的 Tabs 组件
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
