'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { categoryConfig, importanceConfig } from './config'

interface TimelineEvent {
  id: number
  year: number
  month: number | null
  day: number | null
  title: string
  title_en: string | null
  description: string
  category: string | null
  importance: string
  icon: string | null
  image: string | null
  tags: string[] | null
  view_count: number
}

interface Props {
  totalCount: number
}

export function TimelineList({ totalCount }: Props) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(totalCount)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLandmarkOnly, setShowLandmarkOnly] = useState(false)
  const pageSize = 20
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchEvents = useCallback(async (pageNum: number, category: string | null, decade: string | null, search: string, landmarkOnly: boolean) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
      })
      
      if (category) {
        params.append('category', category)
      }
      if (decade) {
        const startYear = parseInt(decade)
        const endYear = startYear + 9
        params.append('yearRange', `${startYear}-${endYear}`)
      }
      if (search) {
        params.append('search', search)
      }
      if (landmarkOnly) {
        params.append('importance', 'landmark')
      }

      const res = await fetch(`/api/timeline?${params}`)
      const data = await res.json()

      if (data.success) {
        if (pageNum === 1) {
          setEvents(data.data.data)
        } else {
          setEvents(prev => [...prev, ...data.data.data])
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
    fetchEvents(1, selectedCategory, selectedDecade, searchQuery, showLandmarkOnly)
    setPage(1)
  }, [selectedCategory, selectedDecade, searchQuery, showLandmarkOnly, fetchEvents])

  // 无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          const totalPages = Math.ceil(total / pageSize)
          if (page < totalPages) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchEvents(nextPage, selectedCategory, selectedDecade, searchQuery, showLandmarkOnly)
          }
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loading, page, total, selectedCategory, selectedDecade, searchQuery, showLandmarkOnly, fetchEvents])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPage(1)
    fetchEvents(1, selectedCategory, selectedDecade, searchQuery, showLandmarkOnly)
  }

  // 按年份分组
  const groupedEvents = events.reduce((acc, event) => {
    const year = event.year
    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(event)
    return acc
  }, {} as Record<number, TimelineEvent[]>)

  const sortedYears = Object.keys(groupedEvents)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 sticky top-16 bg-background/95 backdrop-blur py-4 z-10 -mt-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            全部
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedCategory === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex-1 flex gap-2 lg:justify-end">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 lg:flex-initial">
            <input
              type="text"
              placeholder="搜索事件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-1.5 border rounded-lg bg-background flex-1 lg:w-48 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              搜索
            </button>
          </form>
          
          <button
            onClick={() => setShowLandmarkOnly(!showLandmarkOnly)}
            className={`px-3 py-1.5 border rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              showLandmarkOnly
                ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'bg-background hover:bg-muted'
            }`}
          >
            <span>🏆</span>
            <span className="hidden sm:inline">里程碑</span>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent transform md:-translate-x-1/2" />

        {/* Events by Year */}
        {sortedYears.map((year) => (
          <div key={year} id={`${Math.floor(year / 10) * 10}s`} className="relative mb-8">
            {/* Year Marker */}
            <div className="flex items-center gap-4 mb-4 md:justify-center">
              <div className="w-8 md:w-auto" />
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                {year}
              </div>
            </div>

            {/* Events */}
            <div className="space-y-4">
              {groupedEvents[year].map((event, index) => {
                const categoryInfo = event.category && categoryConfig[event.category]
                const importanceInfo = importanceConfig[event.importance] || importanceConfig.normal
                const isLeft = index % 2 === 0

                return (
                  <div
                    key={event.id}
                    className={`relative flex items-start gap-4 ${
                      'md:justify-center'
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary transform -translate-x-1/2 mt-5 z-10" />
                    
                    {/* Event Card */}
                    <Link
                      href={`/timeline/${event.id}`}
                      className={`group flex-1 bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 ${
                        'md:w-[calc(50%-2rem)]'
                      } ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl flex-shrink-0">{event.icon || '📌'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-muted-foreground">
                                {event.year}
                                {event.month && `.${event.month.toString().padStart(2, '0')}`}
                                {event.day && `.${event.day.toString().padStart(2, '0')}`}
                              </span>
                              {categoryInfo && (
                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                  {categoryInfo.icon} {categoryInfo.label}
                                </span>
                              )}
                              {event.importance === 'landmark' && (
                                <span className={`text-xs px-2 py-0.5 text-white rounded-full ${importanceInfo.color}`}>
                                  🏆 里程碑
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold mt-1 group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {event.description}
                            </p>
                            {event.tags && event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.tags.slice(0, 3).map((tag, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>没有找到匹配的事件</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={observerRef} className="h-4" />
    </div>
  )
}
