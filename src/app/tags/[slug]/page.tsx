import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient, tryGetSupabaseClient } from '@/storage/database/supabase-client'
import { ToolLogoNext } from '@/components/tools/ToolLogo'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { 
  Eye, Heart, MessageCircle, Star, ArrowLeft,
  Calendar, User
} from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 生成静态参数
export async function generateStaticParams() {
  const supabase = tryGetSupabaseClient()
  if (!supabase) {
    return []
  }
  
  const { data: tags } = await supabase
    .from('tags')
    .select('slug')
  
  return tags?.map((tag) => ({
    slug: tag.slug,
  })) || []
}

// 生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = getSupabaseClient()
  
  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!tag) {
    return {
      title: '标签不存在',
    }
  }

  return {
    title: `${tag.name} - 标签`,
    description: `探索与「${tag.name}」相关的AI工具和资讯`,
  }
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params
  const supabase = getSupabaseClient()

  // 获取标签信息
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (tagError || !tag) {
    notFound()
  }

  // 获取该标签下的工具
  const { data: toolTags } = await supabase
    .from('tool_tags')
    .select(`
      tool_id,
      ai_tools (
        id,
        name,
        slug,
        description,
        website,
        logo,
        view_count,
        favorite_count,
        is_featured,
        is_free,
        created_at,
        category:categories ( id, name, color )
      )
    `)
    .eq('tag_id', tag.id)

  // 处理工具数据
  const tools = toolTags
    ?.map((tt: any) => tt.ai_tools)
    .filter(Boolean)
    .map((tool: any) => ({
      ...tool,
      category: Array.isArray(tool.category) ? tool.category[0] : tool.category
    })) || []

  // 获取该标签下的资讯（tags字段包含该标签名）
  const { data: news } = await supabase
    .from('ai_news')
    .select('id, title, summary, cover_image, category, published_at, view_count, tags')
    .eq('status', 'approved')
    .contains('tags', [tag.name])
    .order('published_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tag Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🏷️</span>
            <h1 className="text-3xl font-bold">{tag.name}</h1>
          </div>
          <p className="text-muted-foreground">
            探索与「{tag.name}」相关的AI工具和资讯
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>{tools.length} 个工具</span>
            {news && news.length > 0 && (
              <span>{news.length} 篇资讯</span>
            )}
          </div>
        </div>

        {/* Tools Section */}
        {tools.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🛠️</span>
              <span>相关工具</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool: any) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group bg-card border rounded-xl p-4 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <ToolLogoNext
                      logo={tool.logo}
                      name={tool.name}
                      website={tool.website}
                      size={48}
                      className="h-12 w-12 rounded-lg shrink-0"
                      fallbackBgColor={tool.category?.color || '#6366F1'}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    {tool.category && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: tool.category.color, color: tool.category.color }}
                      >
                        {tool.category.name}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {tool.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {tool.favorite_count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* News Section */}
        {news && news.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📰</span>
              <span>相关资讯</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {item.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatRelativeTime(item.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.view_count}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {tools.length === 0 && (!news || news.length === 0) && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <h2 className="text-xl font-semibold mb-2">暂无相关内容</h2>
            <p className="text-muted-foreground">
              该标签下暂无工具和资讯
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
