import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 强制动态生成，不在构建时预渲染
export const dynamic = 'force-dynamic'

// 配置：每小时重新验证一次
export const revalidate = 3600 // 1小时（单位：秒）

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayiai.site'
  const now = new Date()
  
  // 静态页面 - 核心页面（高优先级）
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ranking`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]
  
  // 静态页面 - 内容页面
  const contentPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/hall-of-fame`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/timeline`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/article`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/hot-china`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hot-global`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ]
  
  // 静态页面 - 其他页面
  const otherPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/link-submit`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
  
  // 基础站点地图（不包含动态页面）
  const baseSitemap = [
    ...corePages,
    ...contentPages,
    ...otherPages,
  ]
  
  try {
    const supabase = getSupabaseClient()
    
    // 并行获取所有动态数据
    const [
      toolsResult,
      categoriesResult,
      hallOfFameResult,
      newsResult,
      timelineResult,
      tagsResult,
    ] = await Promise.all([
      // 获取所有已审核通过的工具
      supabase
        .from('ai_tools')
        .select('slug, updated_at, created_at')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false }),
      
      // 获取所有启用的工具分类
      supabase
        .from('categories')
        .select('slug, updated_at')
        .eq('is_active', true)
        .order('sort_order'),
      
      // 获取所有名人堂人物
      supabase
        .from('hall_of_fame')
        .select('id, updated_at')
        .eq('is_visible', true)
        .order('sort_order'),
      
      // 获取所有已发布的资讯
      supabase
        .from('ai_news')
        .select('id, slug, updated_at, published_at')
        .eq('status', 'approved')
        .order('published_at', { ascending: false }),
      
      // 获取所有可见的大事纪
      supabase
        .from('ai_timeline')
        .select('id, updated_at')
        .eq('is_visible', true)
        .order('event_date', { ascending: false }),
      
      // 获取所有标签
      supabase
        .from('tags')
        .select('slug, created_at')
        .order('created_at', { ascending: false }),
    ])
    
    const tools = toolsResult.data || []
    const categories = categoriesResult.data || []
    const hallOfFame = hallOfFameResult.data || []
    const news = newsResult.data || []
    const timeline = timelineResult.data || []
    const tags = tagsResult.data || []
    
    // 工具详情页（动态）
    const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: tool.updated_at ? new Date(tool.updated_at) : (tool.created_at ? new Date(tool.created_at) : now),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    // 分类详情页（动态）
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
    
    // 名人堂详情页（动态）
    const hallOfFamePages: MetadataRoute.Sitemap = hallOfFame.map((person) => ({
      url: `${baseUrl}/hall-of-fame/${person.id}`,
      lastModified: person.updated_at ? new Date(person.updated_at) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
    
    // 资讯详情页（动态）
    const newsPages: MetadataRoute.Sitemap = news.map((item) => ({
      url: `${baseUrl}/news/${item.slug || item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : (item.published_at ? new Date(item.published_at) : now),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
    
    // 大事纪详情页（动态）
    const timelinePages: MetadataRoute.Sitemap = timeline.map((event) => ({
      url: `${baseUrl}/timeline/${event.id}`,
      lastModified: event.updated_at ? new Date(event.updated_at) : now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    }))
    
    // 标签详情页（动态）
    const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: tag.created_at ? new Date(tag.created_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
    
    // 合并所有页面
    return [
      ...baseSitemap,
      ...toolPages,
      ...categoryPages,
      ...hallOfFamePages,
      ...newsPages,
      ...timelinePages,
      ...tagPages,
    ]
  } catch (error) {
    // 数据库连接失败时返回基础站点地图
    return baseSitemap
  }
}
