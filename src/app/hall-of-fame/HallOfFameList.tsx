'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { categoryConfig, categoryOrder, getCategoryConfig } from './config'
import { Avatar } from './components/Avatar'

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
  country: string | null
  category: string | null
  tags: string[] | null
  is_featured: boolean
  view_count: number
  birth_year: number | null
}

interface Props {
  totalCount: number
}

export function HallOfFameList({ totalCount }: Props) {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(totalCount)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const pageSize = 12

  const fetchPeople = useCallback(async (pageNum: number, category: string | null, search: string, sort: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        sortBy: sort,
        sortOrder: 'desc',
      })
      
      if (category) {
        params.append('category', category)
      }
      if (search) {
        params.append('search', search)
      }

      const res = await fetch(`/api/hall-of-fame?${params}`)
      const data = await res.json()

      if (data.success) {
        if (pageNum === 1) {
          setPeople(data.data.data)
        } else {
          setPeople(prev => [...prev, ...data.data.data])
        }
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPeople(1, selectedCategory, searchQuery, sortBy)
    setPage(1)
  }, [selectedCategory, searchQuery, sortBy, fetchPeople])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPeople(nextPage, selectedCategory, searchQuery, sortBy)
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(1)
    fetchPeople(1, selectedCategory, searchQuery, sortBy)
  }

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setPage(1)
  }

  const totalPages = Math.ceil(total / pageSize)
  const hasMore = page < totalPages

  return (
    <div>
      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            全部
          </button>
          {categoryOrder.map((key) => {
            const config = categoryConfig[key]
            if (!config) return null
            return (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search and Sort */}
        <div className="flex justify-end gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="搜索人物..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-background w-48"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              搜索
            </button>
          </form>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background text-sm"
          >
            <option value="created_at">最新收录</option>
            <option value="view_count">浏览最多</option>
            <option value="birth_year">出生年份</option>
          </select>
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((person) => (
          <Link
            key={person.id}
            href={`/hall-of-fame/${person.id}`}
            className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex p-4 gap-4">
              {/* Photo */}
              <Avatar 
                src={person.photo} 
                name={person.name_en || person.name} 
                size="md"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {person.name}
                    </h3>
                    {person.name_en && (
                      <p className="text-sm text-muted-foreground">
                        {person.name_en}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 分类标签 */}
                {person.category && (
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getCategoryConfig(person.category)?.color || 'bg-muted'} text-foreground`}>
                      <span>{getCategoryConfig(person.category)?.icon}</span>
                      <span>{getCategoryConfig(person.category)?.label}</span>
                    </span>
                  </div>
                )}
                
                {person.title && (
                  <p className="text-sm font-medium text-primary/80 mt-1 line-clamp-1">
                    {person.title}
                  </p>
                )}
                
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {person.summary}
                </p>

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {person.country && (
                    <span className="flex items-center gap-1">
                      <span>🌍</span>
                      {person.country}
                    </span>
                  )}
                  {person.birth_year && (
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      {person.birth_year}年
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span>👁️</span>
                    {person.view_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && people.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>没有找到匹配的人物</p>
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            加载更多 ({page}/{totalPages})
          </button>
        </div>
      )}
    </div>
  )
}
