'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Star, Eye, ExternalLink } from 'lucide-react'
import { useConfirm } from '@/hooks/use-confirm'

const categoryConfig = {
  pioneer: { label: '先驱者', icon: '🌟', color: 'from-yellow-500/20 to-orange-500/20' },
  research: { label: '研究者', icon: '🔬', color: 'from-blue-500/20 to-cyan-500/20' },
  researcher: { label: '学者', icon: '🎓', color: 'from-blue-400/20 to-sky-500/20' },
  entrepreneur: { label: '企业家', icon: '💼', color: 'from-green-500/20 to-emerald-500/20' },
  engineering: { label: '工程师', icon: '⚙️', color: 'from-purple-500/20 to-pink-500/20' },
  engineer: { label: '开发者', icon: '💻', color: 'from-purple-400/20 to-fuchsia-500/20' },
  vision: { label: '视觉专家', icon: '👁️', color: 'from-rose-500/20 to-red-500/20' },
  nlp: { label: 'NLP专家', icon: '💬', color: 'from-teal-500/20 to-cyan-500/20' },
  robotics: { label: '机器人', icon: '🤖', color: 'from-amber-500/20 to-yellow-500/20' },
  education: { label: '教育家', icon: '📚', color: 'from-lime-500/20 to-green-500/20' },
  team: { label: '团队', icon: '👥', color: 'from-indigo-500/20 to-violet-500/20' },
}

interface Person {
  id: number
  name: string
  name_en: string | null
  photo: string | null
  title: string | null
  summary: string
  bio: string | null
  achievements: string[] | null
  organization: string | null
  organization_url: string | null
  country: string | null
  category: string | null
  tags: string[] | null
  is_featured: boolean
  view_count: number
  birth_year: number | null
}

// 预览弹窗组件
function PreviewDialog({ 
  person, 
  open, 
  onOpenChange 
}: { 
  person: Person | null
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  if (!person) return null

  const categoryInfo = person.category ? categoryConfig[person.category as keyof typeof categoryConfig] : null

  // 获取名字首字母
  const getInitials = (name: string) => {
    const parts = name.split(/[\s-]+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            预览 - {person.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 头部信息 */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl">
            <div className="flex flex-col md:flex-row gap-6">
              {/* 头像 */}
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center flex-shrink-0">
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary">
                    {getInitials(person.name_en || person.name)}
                  </span>
                )}
              </div>

              {/* 基本信息 */}
              <div className="flex-1">
                <div className="flex items-start gap-3 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold">{person.name}</h2>
                    {person.name_en && (
                      <p className="text-lg text-muted-foreground mt-1">{person.name_en}</p>
                    )}
                  </div>
                  {categoryInfo && (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1.5">
                      <span>{categoryInfo.icon}</span>
                      <span>{categoryInfo.label}</span>
                    </span>
                  )}
                  {person.is_featured && (
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium">
                      ⭐ 精选
                    </span>
                  )}
                </div>

                {person.title && (
                  <p className="text-lg text-primary/80 font-medium mt-3">
                    {person.title}
                  </p>
                )}

                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {person.summary}
                </p>

                {/* 元信息 */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  {person.country && (
                    <div className="flex items-center gap-1.5">
                      <span>🌍</span>
                      <span>{person.country}</span>
                    </div>
                  )}
                  {person.birth_year && (
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>{person.birth_year}年出生</span>
                    </div>
                  )}
                  {person.organization && (
                    <div className="flex items-center gap-1.5">
                      <span>🏢</span>
                      <span>{person.organization}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span>👁️</span>
                    <span>{person.view_count || 0} 次浏览</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 人物传记 */}
          {person.bio && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📖</span>
                <span>人物传记</span>
              </h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {person.bio}
              </div>
            </div>
          )}

          {/* 主要成就 */}
          {person.achievements && person.achievements.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏆</span>
                <span>主要成就</span>
              </h3>
              <ul className="space-y-3">
                {person.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary text-lg mt-0.5">✓</span>
                    <span className="text-muted-foreground">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 研究领域标签 */}
          {person.tags && person.tags.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏷️</span>
                <span>研究领域</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {person.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 底部操作 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
            <Button asChild>
              <Link href={`/hall-of-fame/${person.id}`} target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                查看完整页面
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function HallOfFameManagementPage() {
  const router = useRouter()
  const { confirm, ConfirmDialog } = useConfirm()
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  })
  const [previewPerson, setPreviewPerson] = useState<Person | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    fetchPeople()
  }, [page, filters])

  const fetchPeople = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      })

      const response = await fetch(`/api/hall-of-fame?${params}`)
      const result = await response.json()

      if (result.success) {
        setPeople(result.data.data)
        setTotal(result.data.total)
      }
    } catch (error) {
      console.error('获取名人列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = await confirm({
      title: '删除确认',
      description: '确定要删除这个人物吗？此操作不可撤销。',
      confirmText: '删除',
      destructive: true,
    })

    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/hall-of-fame/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast.success('删除成功')
        fetchPeople()
      } else {
        toast.error(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  const handleToggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/hall-of-fame/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success('操作成功')
        fetchPeople()
      } else {
        toast.error(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  const handlePreview = (person: Person) => {
    setPreviewPerson(person)
    setPreviewOpen(true)
  }

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      <PreviewDialog 
        person={previewPerson} 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
      />
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI名人堂管理</CardTitle>
            <Button asChild>
              <Link href="/admin/hall-of-fame/new">
                <Plus className="mr-2 h-4 w-4" />
                新增人物
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 筛选器 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value === 'all' ? '' : value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {Object.entries(categoryConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.icon} {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>英文名</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>头衔</TableHead>
                <TableHead>浏览</TableHead>
                <TableHead>推荐</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : people.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/hall-of-fame/${person.id}`}
                        className="hover:text-primary transition-colors cursor-pointer"
                        title="点击查看详情"
                        target="_blank"
                      >
                        {person.name}
                      </Link>
                    </TableCell>
                    <TableCell>{person.name_en || '-'}</TableCell>
                    <TableCell>
                      {person.category && categoryConfig[person.category as keyof typeof categoryConfig] && (
                        <span>
                          {categoryConfig[person.category as keyof typeof categoryConfig].icon}{' '}
                          {categoryConfig[person.category as keyof typeof categoryConfig].label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{person.title || '-'}</TableCell>
                    <TableCell>{person.view_count || 0}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFeatured(person.id, person.is_featured)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            person.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                          }`}
                        />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          asChild
                          title="查看详情"
                        >
                          <Link href={`/hall-of-fame/${person.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePreview(person)}
                          title="预览"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/hall-of-fame/${person.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(person.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                上一页
              </Button>
              <span className="py-2 px-4">
                第 {page} / {Math.ceil(total / 20)} 页
              </span>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
