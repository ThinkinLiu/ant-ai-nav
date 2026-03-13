'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Star } from 'lucide-react'

const categoryConfig = {
  pioneer: { label: '先驱者', icon: '🌟' },
  research: { label: '研究者', icon: '🔬' },
  researcher: { label: '学者', icon: '🎓' },
  entrepreneur: { label: '企业家', icon: '💼' },
  engineering: { label: '工程师', icon: '⚙️' },
  engineer: { label: '开发者', icon: '💻' },
  vision: { label: '视觉专家', icon: '👁️' },
  nlp: { label: 'NLP专家', icon: '💬' },
  robotics: { label: '机器人', icon: '🤖' },
  education: { label: '教育家', icon: '📚' },
  team: { label: '团队', icon: '👥' },
}

export default function HallOfFameManagementPage() {
  const router = useRouter()
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  })

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
    if (!confirm('确定要删除这个人物吗？')) return

    try {
      const response = await fetch(`/api/admin/hall-of-fame/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchPeople()
      } else {
        alert(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
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
        fetchPeople()
      } else {
        alert(result.error || '操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败')
    }
  }

  return (
    <div className="space-y-6">
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
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
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
                    <TableCell className="font-medium">{person.name}</TableCell>
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
