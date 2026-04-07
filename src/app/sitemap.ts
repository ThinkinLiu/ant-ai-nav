import { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 强制动态生成，不在构建时预渲染
export const dynamic = 'force-dynamic'

// 配置：每小时重新验证一次
export const revalidate = 3600 // 1小时（单位：秒）

// 辅助函数：验证并返回正确的更新频率类型
function getValidChangeFrequency(value: string): MetadataRoute.Sitemap[number]['changeFrequency'] {
  const validFreqs: MetadataRoute.Sitemap[number]['changeFrequency'][] = [
    'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
  ]
  return validFreqs.includes(value as any) ? value as any : 'weekly'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseClient()
  const now = new Date()
  
  // 从数据库读取SEO配置
  let seoConfig = null
  try {
    const { data } = await supabase
      .from('seo_settings')
      .select('*')
      .single()
    
    if (data) {
      seoConfig = data
    }
  } catch (error) {
    console.error('读取SEO配置失败:', error)
  }
  
  // 判断是否启用sitemap
  const sitemapEnabled = seoConfig?.sitemap_enabled !== false // 默认启用
  
  if (!sitemapEnabled) {
    // 如果禁用sitemap，返回空数组
    return []
  }
  
  // 获取域名：优先使用数据库配置 > 环境变量 > 默认值
  const baseUrl = seoConfig?.sitemap_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://mayiai.site'
  
  // 获取默认更新频率
  const defaultChangeFreq = getValidChangeFrequency(seoConfig?.sitemap_changefreq_default || 'weekly')
  
  // 获取默认优先级
  const defaultPriority = parseFloat(seoConfig?.sitemap_priority_default || '0.5')
  
  // 获取排除路径
  const excludePaths = seoConfig?.sitemap_exclude_paths
    ? seoConfig.sitemap_exclude_paths.split('\n').map((p: string) => p.trim()).filter((p: string) => p)
    : []
  
  // 检查路径是否被排除
  const isExcluded = (path: string) => {
    return excludePaths.some((excludePath: string) => {
      if (excludePath.endsWith('*')) {
        // 通配符匹配
        const prefix = excludePath.slice(0, -1)
        return path.startsWith(prefix)
      }
      return path === excludePath
    })
  }
  
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
  ].filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
  
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
  ].filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
  
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
  ].filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
  
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
      changeFrequency: defaultChangeFreq,
      priority: Math.min(defaultPriority + 0.2, 1), // 工具详情优先级略高于默认值
    })).filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
    
    // 分类详情页（动态）
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : now,
      changeFrequency: defaultChangeFreq,
      priority: Math.min(defaultPriority + 0.2, 1), // 分类详情优先级略高于默认值
    })).filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
    
    // 名人堂详情页（动态）
    const hallOfFamePages: MetadataRoute.Sitemap = hallOfFame.map((person) => ({
      url: `${baseUrl}/hall-of-fame/${person.id}`,
      lastModified: person.updated_at ? new Date(person.updated_at) : now,
      changeFrequency: 'monthly',
      priority: Math.min(defaultPriority + 0.1, 1), // 名人堂优先级略高于默认值
    })).filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
    
    // 资讯详情页（动态）
    const newsPages: MetadataRoute.Sitemap = news.map((item) => ({
      url: `${baseUrl}/news/${item.slug || item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : (item.published_at ? new Date(item.published_at) : now),
      changeFrequency: 'monthly',
      priority: Math.min(defaultPriority + 0.1, 1), // 资讯详情优先级略高于默认值
    })).filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
    
    // 大事纪详情页（动态）
    const timelinePages: MetadataRoute.Sitemap = timeline.map((event) => ({
      url: `${baseUrl}/timeline/${event.id}`,
      lastModified: event.updated_at ? new Date(event.updated_at) : now,
      changeFrequency: 'yearly',
      priority: Math.max(defaultPriority - 0.1, 0), // 大事纪优先级略低于默认值
    })).filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
    
    // 标签详情页（动态）
    const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: tag.created_at ? new Date(tag.created_at) : now,
      changeFrequency: defaultChangeFreq,
      priority: Math.min(defaultPriority + 0.1, 1), // 标签详情优先级略高于默认值
    })).filter(page => !isExcluded(new URL(page.url).pathname)) as MetadataRoute.Sitemap
    
    // 自定义URL（从数据库读取）
    const customUrls: MetadataRoute.Sitemap = []
    if (seoConfig?.sitemap_custom_urls && Array.isArray(seoConfig.sitemap_custom_urls)) {
      for (const customUrl of seoConfig.sitemap_custom_urls) {
        if (customUrl.url) {
          // 验证自定义URL的更新频率
          const customChangeFreq = customUrl.changeFrequency 
            ? getValidChangeFrequency(customUrl.changeFrequency)
            : defaultChangeFreq
          
          customUrls.push({
            url: `${baseUrl}${customUrl.url.startsWith('/') ? '' : '/'}${customUrl.url}`,
            lastModified: customUrl.lastModified ? new Date(customUrl.lastModified) : now,
            changeFrequency: customChangeFreq,
            priority: customUrl.priority !== undefined ? customUrl.priority : defaultPriority,
          })
        }
      }
    }
    
    // 合并所有页面
    return [
      ...baseSitemap,
      ...toolPages,
      ...categoryPages,
      ...hallOfFamePages,
      ...newsPages,
      ...timelinePages,
      ...tagPages,
      ...customUrls,
    ]
  } catch (error) {
    // 数据库连接失败时返回基础站点地图
    return baseSitemap
  }
}
