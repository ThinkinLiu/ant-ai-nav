'use client'

import Link from 'next/link'
import { getCategoryConfig } from '../config'
import { Avatar } from '../components/Avatar'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'

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
  created_at: string
}

interface RelatedPerson {
  id: number
  name: string
  name_en: string | null
  photo: string | null
  title: string | null
  summary: string
  category: string | null
}

interface Props {
  person: Person
  relatedPeople: RelatedPerson[]
}

export function PersonDetail({ person, relatedPeople }: Props) {
  const { user } = useAuth()
  const categoryInfo = getCategoryConfig(person.category)

  // 检查是否是管理员
  const isAdmin = user?.role === 'admin'

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link href="/hall-of-fame" className="hover:text-foreground transition-colors">
          AI名人堂
        </Link>
        <span>/</span>
        <span className="text-foreground">{person.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo */}
                <Avatar 
                  src={person.photo} 
                  name={person.name_en || person.name} 
                  size="lg"
                  className="shadow-lg"
                />

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-3">
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold">{person.name}</h1>
                          {person.name_en && (
                            <p className="text-lg text-muted-foreground mt-1">{person.name_en}</p>
                          )}
                        </div>
                        {/* 管理员修改按钮 */}
                        {isAdmin && (
                          <Button variant="outline" size="sm" asChild className="gap-1">
                            <Link href={`/admin/hall-of-fame/${person.id}/edit`}>
                              <Edit className="h-4 w-4" />
                              修改
                            </Link>
                          </Button>
                        )}
                      </div>
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

                  {/* Meta Info */}
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
                        {person.organization_url ? (
                          <a
                            href={person.organization_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {person.organization}
                          </a>
                        ) : (
                          <span>{person.organization}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span>👁️</span>
                      <span>{person.view_count} 次浏览</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Biography */}
          {person.bio && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📖</span>
                <span>人物传记</span>
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {person.bio}
              </div>
            </div>
          )}

          {/* Achievements */}
          {person.achievements && person.achievements.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏆</span>
                <span>主要成就</span>
              </h2>
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

          {/* Tags */}
          {person.tags && person.tags.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🏷️</span>
                <span>研究领域</span>
              </h2>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">快速信息</h3>
            <div className="space-y-3 text-sm">
              {categoryInfo && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">类型</span>
                  <span className="flex items-center gap-1.5">
                    <span>{categoryInfo.icon}</span>
                    <span>{categoryInfo.label}</span>
                  </span>
                </div>
              )}
              {person.birth_year && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">出生年份</span>
                  <span>{person.birth_year}</span>
                </div>
              )}
              {person.country && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">国家/地区</span>
                  <span>{person.country}</span>
                </div>
              )}
              {person.organization && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">所属机构</span>
                  <span className="text-right max-w-[150px] truncate">{person.organization}</span>
                </div>
              )}
            </div>
          </div>

          {/* Related People */}
          {relatedPeople.length > 0 && (
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4">相关人物</h3>
              <div className="space-y-4">
                {relatedPeople.map((related) => (
                  <Link
                    key={related.id}
                    href={`/hall-of-fame/${related.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar 
                      src={related.photo} 
                      name={related.name_en || related.name} 
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                        {related.name}
                      </p>
                      {related.title && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {related.title}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back Link */}
          <Link
            href="/hall-of-fame"
            className="block text-center py-3 px-4 border rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            ← 返回AI名人堂
          </Link>
        </div>
      </div>
    </div>
  )
}
