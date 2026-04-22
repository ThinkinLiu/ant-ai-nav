import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSupabaseClient, tryGetSupabaseClient } from '@/storage/database/supabase-client'
import { categoryConfig } from '../config'
import { NewsDetail } from './NewsDetail'

interface Props {
  params: Promise<{ id: string }>
}

// 强制动态渲染，避免构建时访问数据库
export const dynamic = 'force-dynamic'

// 生成静态参数 - 在构建时如果环境变量不存在则返回空数组
export async function generateStaticParams() {
  const supabase = tryGetSupabaseClient()
  if (!supabase) {
    return []
  }
  
  const { data: news } = await supabase
    .from('ai_news')
    .select('id')
  
  return news?.map((item) => ({
    id: item.id.toString(),
  })) || []
}

// 生成元数据
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = getSupabaseClient()
  
  const { data: news } = await supabase
    .from('ai_news')
    .select('title, summary, cover_image')
    .eq('id', parseInt(id))
    .single()

  if (!news) {
    return {
      title: '资讯不存在',
    }
  }

  return {
    title: `${news.title} - AI资讯`,
    description: news.summary,
    openGraph: {
      title: news.title,
      description: news.summary,
      images: news.cover_image ? [news.cover_image] : [],
    },
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = getSupabaseClient()

  // 支持 slug 和数字 ID 两种方式访问
  let news: any
  if (/^\d+$/.test(id)) {
    // 如果是数字 ID，使用 ID 查询
    const result = await supabase
      .from('ai_news')
      .select('*')
      .eq('id', parseInt(id))
      .single()
    news = result.data
  } else {
    // 如果是 slug，使用 slug 查询
    const result = await supabase
      .from('ai_news')
      .select('*')
      .eq('slug', id)
      .single()
    news = result.data
  }

  if (!news) {
    notFound()
  }

  // 增加浏览量
  await supabase
    .from('ai_news')
    .update({ view_count: (news.view_count || 0) + 1 })
    .eq('id', news.id)

  // 获取相关资讯
  let relatedNews: any[] = []
  
  if (news.category) {
    const { data: sameCategory } = await supabase
      .from('ai_news')
      .select('id, title, summary, cover_image, category, published_at, view_count')
      .eq('category', news.category)
      .neq('id', news.id)
      .order('published_at', { ascending: false })
      .limit(5)
    
    relatedNews = sameCategory || []
  }

  // 如果不够5条，补充热门资讯
  if (relatedNews.length < 5) {
    const existingIds = relatedNews.map(n => n.id)
    existingIds.push(news.id)
    
    const { data: moreNews } = await supabase
      .from('ai_news')
      .select('id, title, summary, cover_image, category, published_at, view_count')
      .not('id', 'in', `(${existingIds.join(',')})`)
      .order('view_count', { ascending: false })
      .limit(5 - relatedNews.length)
    
    if (moreNews) {
      relatedNews = [...relatedNews, ...moreNews]
    }
  }

  // 获取上一篇和下一篇
  const { data: prevNews } = await supabase
    .from('ai_news')
    .select('id, title')
    .lt('published_at', news.published_at)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  const { data: nextNews } = await supabase
    .from('ai_news')
    .select('id, title')
    .gt('published_at', news.published_at)
    .order('published_at', { ascending: true })
    .limit(1)
    .single()

  // 获取关联的工具
  let relatedTools: any[] = []
  if (news.related_tools && Array.isArray(news.related_tools) && news.related_tools.length > 0) {
    const { data: tools } = await supabase
      .from('ai_tools')
      .select('*')
      .in('id', news.related_tools)

    relatedTools = tools || []
  }

  return (
    <NewsDetail
      news={{
        ...news,
        view_count: (news.view_count || 0) + 1,
      }}
      relatedNews={relatedNews}
      prevNews={prevNews}
      nextNews={nextNews}
      relatedTools={relatedTools}
    />
  )
}
