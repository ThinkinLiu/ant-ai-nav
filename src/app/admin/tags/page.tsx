'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { formatRelativeTime } from '@/lib/utils'
import { ToolLogo } from '@/components/tools/ToolLogo'
import { 
  Plus, Edit, Trash2, Save, Tag, Search, X, ExternalLink, Eye, Heart, Loader2, Newspaper
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Tag {
  id: number
  name: string
  slug: string
  created_at: string
  toolCount?: number
  newsCount?: number
}

interface TagTool {
  id: number
  name: string
  slug: string
  description: string
  website: string
  logo: string | null
  status: string
  view_count: number
  favorite_count: number
  created_at: string
  category: { id: number; name: string; color: string } | null
}

interface TagNews {
  id: number
  title: string
  slug: string
  summary: string
  cover_image: string | null
  source: string
  view_count: number
  status: string
  created_at: string
  category: string | null
}

export default function TagsAdminPage() {
  const { token } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [toolsDialogOpen, setToolsDialogOpen] = useState(false)
  const [newsDialogOpen, setNewsDialogOpen] = useState(false)
  const [currentTag, setCurrentTag] = useState<Tag | null>(null)
  const [tagTools, setTagTools] = useState<TagTool[]>([])
  const [tagNews, setTagNews] = useState<TagNews[]>([])
  const [toolsLoading, setToolsLoading] = useState(false)
  const [newsLoading, setNewsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })

  useEffect(() => {
    fetchTags()
  }, [token])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTags(tags)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredTags(tags.filter(tag => 
        tag.name.toLowerCase().includes(query) || 
        tag.slug.toLowerCase().includes(query)
      ))
    }
  }, [searchQuery, tags])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
        setFilteredTags(data.data)
      }
    } catch (error) {
      console.error('获取标签失败:', error)
      toast.error('获取标签失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tag: Tag) => {
    setCurrentTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
    })
    setEditDialogOpen(true)
  }

  const handleAdd = () => {
    setCurrentTag(null)
    setFormData({
      name: '',
      slug: '',
    })
    setAddDialogOpen(true)
  }

  // 自动生成slug
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: generateSlug(name),
    })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('请填写必填项')
      return
    }

    setSaving(true)
    try {
      const url = currentTag 
        ? `/api/admin/tags/${currentTag.id}`
        : '/api/admin/tags'
      const method = currentTag ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(currentTag ? '保存成功' : '创建成功')
        setEditDialogOpen(false)
        setAddDialogOpen(false)
        fetchTags()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      toast.error('操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tag: Tag) => {
    // 检查是否有关联的工具或资讯
    const hasRelations = (tag.toolCount && tag.toolCount > 0) || (tag.newsCount && tag.newsCount > 0)
    
    if (hasRelations) {
      const toolInfo = tag.toolCount ? `${tag.toolCount} 个工具` : ''
      const newsInfo = tag.newsCount ? `${tag.newsCount} 个资讯` : ''
      const relations = [toolInfo, newsInfo].filter(Boolean).join('、')
      
      if (!confirm(`标签"${tag.name}"关联了 ${relations}，删除后关联将解除。确定要删除吗？`)) {
        return
      }
    } else {
      if (!confirm(`确定要删除标签"${tag.name}"吗？`)) {
        return
      }
    }

    try {
      const response = await fetch(`/api/admin/tags/${tag.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (data.success) {
        toast.success('删除成功')
        fetchTags()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  // 查看关联工具
  const handleViewTools = async (tag: Tag) => {
    setCurrentTag(tag)
    setToolsDialogOpen(true)
    setToolsLoading(true)
    setTagTools([])
    
    try {
      const response = await fetch(`/api/admin/tags/${tag.id}/tools`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTagTools(data.data)
      } else {
        toast.error(data.error || '获取工具列表失败')
      }
    } catch (error) {
      console.error('获取关联工具失败:', error)
      toast.error('获取关联工具失败')
    } finally {
      setToolsLoading(false)
    }
  }

  // 查看关联资讯
  const handleViewNews = async (tag: Tag) => {
    setCurrentTag(tag)
    setNewsDialogOpen(true)
    setNewsLoading(true)
    setTagNews([])
    
    try {
      const response = await fetch(`/api/admin/tags/${tag.id}/news`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTagNews(data.data)
      } else {
        toast.error(data.error || '获取资讯列表失败')
      }
    } catch (error) {
      console.error('获取关联资讯失败:', error)
      toast.error('获取关联资讯失败')
    } finally {
      setNewsLoading(false)
    }
  }

  // 移除工具与标签的关联
  const handleRemoveTool = async (toolId: number) => {
    if (!currentTag) return
    
    if (!confirm('确定要移除该工具与此标签的关联吗？')) {
      return
    }
    
    try {
      // 获取工具当前的所有标签
      const response = await fetch(`/api/tools/${toolId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      
      if (data.success) {
        // 过滤掉当前标签
        const newTags = (data.data.tags || [])
          .filter((t: any) => t.id !== currentTag.id)
          .map((t: any) => t.name)
        
        // 更新工具的标签
        const updateResponse = await fetch(`/api/tools/${toolId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tags: newTags }),
        })
        
        const updateData = await updateResponse.json()
        if (updateData.success) {
          toast.success('已移除关联')
          // 刷新列表
          setTagTools(prev => prev.filter(t => t.id !== toolId))
          fetchTags()
        } else {
          toast.error(updateData.error || '移除失败')
        }
      }
    } catch (error) {
      console.error('移除关联失败:', error)
      toast.error('移除关联失败')
    }
  }

  // 移除资讯与标签的关联
  const handleRemoveNews = async (newsId: number) => {
    if (!currentTag) return
    
    if (!confirm('确定要移除该资讯与此标签的关联吗？')) {
      return
    }
    
    try {
      // 直接从 news_tags 表删除关联
      const response = await fetch(`/api/admin/news/${newsId}/tags`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tagId: currentTag.id }),
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success('已移除关联')
        // 刷新列表
        setTagNews(prev => prev.filter(n => n.id !== newsId))
        fetchTags()
      } else {
        toast.error(data.error || '移除失败')
      }
    } catch (error) {
      console.error('移除关联失败:', error)
      toast.error('移除关联失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">标签管理</h1>
          <p className="text-muted-foreground mt-1">
            管理工具标签，支持添加、编辑、删除标签
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          添加标签
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索标签名称或标识..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            标签列表
            <Badge variant="secondary" className="ml-2">
              共 {tags.length} 个标签
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tags/${encodeURIComponent(tag.slug)}`}
                      className="font-medium hover:text-primary transition-colors cursor-pointer"
                      target="_blank"
                      title="点击查看标签主页"
                    >
                      {tag.name}
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {tag.slug}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <button
                      className="hover:text-primary cursor-pointer underline underline-offset-2"
                      onClick={() => handleViewTools(tag)}
                    >
                      关联工具: {tag.toolCount || 0} 个
                    </button>
                    <span>•</span>
                    <button
                      className="hover:text-primary cursor-pointer underline underline-offset-2"
                      onClick={() => handleViewNews(tag)}
                    >
                      关联资讯: {tag.newsCount || 0} 个
                    </button>
                    <span>•</span>
                    <span>ID: {tag.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    title="查看标签主页"
                  >
                    <Link href={`/tags/${encodeURIComponent(tag.slug)}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredTags.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? '没有找到匹配的标签' : '暂无标签'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="标签名称"
              />
            </div>

            <div className="space-y-2">
              <Label>标识 *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="唯一标识（英文）"
              />
              <p className="text-xs text-muted-foreground">
                用于URL路径，建议使用英文或拼音
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="标签名称"
              />
            </div>

            <div className="space-y-2">
              <Label>标识 *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="唯一标识（英文）"
              />
              <p className="text-xs text-muted-foreground">
                用于URL路径，建议使用英文或拼音
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 关联工具对话框 */}
      <Dialog open={toolsDialogOpen} onOpenChange={setToolsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              标签「{currentTag?.name}」关联的工具
              <Badge variant="secondary">{tagTools.length} 个</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {toolsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tagTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无关联的工具
              </div>
            ) : (
              <div className="space-y-3">
                {tagTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <ToolLogo
                      logo={tool.logo}
                      name={tool.name}
                      website={tool.website}
                      size={40}
                      className="h-10 w-10 rounded-lg shrink-0"
                      fallbackBgColor={tool.category?.color || '#6366F1'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tool.name}</span>
                        <Badge 
                          variant={tool.status === 'approved' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {tool.status === 'approved' ? '已通过' : tool.status === 'pending' ? '待审核' : '已拒绝'}
                        </Badge>
                        {tool.category && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: tool.category.color, color: tool.category.color }}
                          >
                            {tool.category.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {tool.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {tool.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {tool.favorite_count}
                        </span>
                        <span>{formatRelativeTime(tool.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="查看详情"
                      >
                        <Link href={`/tools/${tool.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveTool(tool.id)}
                        title="移除关联"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 关联资讯对话框 */}
      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              标签「{currentTag?.name}」关联的资讯
              <Badge variant="secondary">{tagNews.length} 个</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            {newsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tagNews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无关联的资讯
              </div>
            ) : (
              <div className="space-y-3">
                {tagNews.map((news) => (
                  <div
                    key={news.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="w-16 h-12 rounded overflow-hidden shrink-0 bg-muted">
                      {news.cover_image ? (
                        <Image
                          src={news.cover_image}
                          alt={news.title}
                          width={64}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium line-clamp-1">{news.title}</span>
                        <Badge 
                          variant={news.status === 'published' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {news.status === 'published' ? '已发布' : news.status === 'draft' ? '草稿' : news.status}
                        </Badge>
                        {news.category && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {news.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {news.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {news.view_count}
                        </span>
                        <span>{news.source}</span>
                        <span>{formatRelativeTime(news.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="查看详情"
                      >
                        <Link href={`/news/${news.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveNews(news.id)}
                        title="移除关联"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
