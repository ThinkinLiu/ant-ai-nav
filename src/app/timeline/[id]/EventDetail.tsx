'use client'

import Link from 'next/link'
import { categoryConfig, importanceConfig } from '../config'

interface RelatedPerson {
  id: number
  name: string
  name_en: string | null
  photo: string | null
  title: string | null
}

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
  related_person_id: number | null
  related_url: string | null
  tags: string[] | null
  view_count: number
  related_person: RelatedPerson | null
}

interface SameYearEvent {
  id: number
  year: number
  month: number | null
  day: number | null
  title: string
  icon: string | null
  importance: string
}

interface NavEvent {
  id: number
  year: number
  title: string
  icon: string | null
}

interface Props {
  event: TimelineEvent
  sameYearEvents: SameYearEvent[]
  prevEvent: NavEvent | null
  nextEvent: NavEvent | null
}

export function EventDetail({ event, sameYearEvents, prevEvent, nextEvent }: Props) {
  const categoryInfo = event.category && categoryConfig[event.category]
  const importanceInfo = importanceConfig[event.importance] || importanceConfig.normal

  const formatDate = () => {
    let date = `${event.year}年`
    if (event.month) {
      date += `${event.month}月`
      if (event.day) {
        date += `${event.day}日`
      }
    }
    return date
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link href="/timeline" className="hover:text-foreground transition-colors">
          AI大事纪
        </Link>
        <span>/</span>
        <span className="text-foreground">{event.year}年</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Icon */}
                <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center shadow-lg text-4xl">
                  {event.icon || '📌'}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        {formatDate()}
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold mt-1">{event.title}</h1>
                      {event.title_en && (
                        <p className="text-lg text-muted-foreground mt-1">{event.title_en}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {categoryInfo && (
                      <span className="px-3 py-1 bg-muted rounded-full text-sm flex items-center gap-1.5">
                        <span>{categoryInfo.icon}</span>
                        <span>{categoryInfo.label}</span>
                      </span>
                    )}
                    <span className={`px-3 py-1 text-white rounded-full text-sm ${importanceInfo.color}`}>
                      {importanceInfo.label}
                    </span>
                  </div>

                  <p className="text-muted-foreground mt-4 leading-relaxed text-lg">
                    {event.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>👁️</span>
                      <span>{event.view_count + 1} 次浏览</span>
                    </div>
                    {event.related_url && (
                      <a
                        href={event.related_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        <span>🔗</span>
                        <span>相关链接</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          {event.image && (
            <div className="bg-card border rounded-xl overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏷️</span>
                <span>相关标签</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center bg-card border rounded-xl p-4">
            {prevEvent ? (
              <Link
                href={`/timeline/${prevEvent.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <span>←</span>
                <span className="text-sm">
                  <span className="text-muted-foreground">{prevEvent.year}年</span>
                  <br />
                  <span className="font-medium">{prevEvent.title}</span>
                </span>
              </Link>
            ) : (
              <div />
            )}
            
            {nextEvent ? (
              <Link
                href={`/timeline/${nextEvent.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-right"
              >
                <span className="text-sm">
                  <span className="text-muted-foreground">{nextEvent.year}年</span>
                  <br />
                  <span className="font-medium">{nextEvent.title}</span>
                </span>
                <span>→</span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">事件信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">年份</span>
                <span className="font-medium">{event.year}年</span>
              </div>
              {event.month && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">月份</span>
                  <span>{event.month}月</span>
                </div>
              )}
              {categoryInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">类型</span>
                  <span className="flex items-center gap-1.5">
                    <span>{categoryInfo.icon}</span>
                    <span>{categoryInfo.label}</span>
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">重要性</span>
                <span className={`px-2 py-0.5 text-white rounded text-xs ${importanceInfo.color}`}>
                  {importanceInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Related Person */}
          {event.related_person && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">相关人物</h3>
              <Link
                href={`/hall-of-fame/${event.related_person.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0">
                  {event.related_person.photo ? (
                    <img
                      src={event.related_person.photo}
                      alt={event.related_person.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium group-hover:text-primary transition-colors">
                    {event.related_person.name}
                  </p>
                  {event.related_person.title && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.related_person.title}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Same Year Events */}
          {sameYearEvents.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">{event.year}年其他事件</h3>
              <div className="space-y-3">
                {sameYearEvents.slice(0, 5).map((e) => (
                  <Link
                    key={e.id}
                    href={`/timeline/${e.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <span className="text-lg">{e.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {e.title}
                      </p>
                      {e.month && (
                        <p className="text-xs text-muted-foreground">{e.month}月</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back Link */}
          <Link
            href="/timeline"
            className="block text-center py-3 px-4 border rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            ← 返回AI大事纪
          </Link>
        </div>
      </div>
    </div>
  )
}
