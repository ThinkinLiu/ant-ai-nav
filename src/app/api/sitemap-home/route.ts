import { NextResponse } from 'next/server'
import { MetadataRoute } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 强制动态生成
export const dynamic = 'force-dynamic'

// 辅助函数：验证并返回正确的更新频率类型
function getValidChangeFrequency(value: string): MetadataRoute.Sitemap[number]['changeFrequency'] {
  const validFreqs: MetadataRoute.Sitemap[number]['changeFrequency'][] = [
    'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
  ]
  return validFreqs.includes(value as any) ? value as any : 'weekly'
}

export async function GET(): Promise<NextResponse> {
  const supabase = getSupabaseClient()
  const now = new Date()
  
  // 从数据库读取蚂蚁AI之家（home）的SEO配置
  let seoConfig = null
  try {
    const { data } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('site_type', 'home')
      .single()
    
    if (data) {
      seoConfig = data
    }
  } catch (error) {
    console.error('读取SEO配置失败:', error)
  }
  
  // 判断是否启用sitemap
  const sitemapEnabled = seoConfig?.sitemap_enabled !== false
  
  if (!sitemapEnabled) {
    const emptyXml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
    return new NextResponse(emptyXml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
  
  // 获取域名
  const baseUrl = seoConfig?.sitemap_domain || process.env.NEXT_PUBLIC_SITE_URL || 'https://mayiai.site'
  
  // 获取默认更新频率
  const defaultChangeFreq = getValidChangeFrequency(seoConfig?.sitemap_changefreq_default || 'weekly')
  
  // 获取默认优先级
  const defaultPriority = parseFloat(seoConfig?.sitemap_priority_default || '0.5')
  
  // 获取排除路径
  const excludePaths = seoConfig?.sitemap_exclude_paths
    ? seoConfig.sitemap_exclude_paths.split('\n').map((p: string) => p.trim()).filter((p: string) => p)
    : []
  
  const isExcluded = (path: string) => {
    return excludePaths.some((excludePath: string) => {
      if (excludePath.endsWith('*')) {
        const prefix = excludePath.slice(0, -1)
        return path.startsWith(prefix)
      }
      return path === excludePath
    })
  }
  
  // 构建sitemap URL列表
  const urls: Array<{
    url: string
    lastModified: Date
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
    priority: number
  }> = []
  
  // 蚂蚁AI之家首页
  if (!isExcluded('/blog')) {
    urls.push({
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    })
  }
  
  // 内容页面
  const contentPaths = [
    { path: '/news', freq: 'daily' as const, priority: 0.9 },
    { path: '/timeline', freq: 'weekly' as const, priority: 0.8 },
    { path: '/hall-of-fame', freq: 'weekly' as const, priority: 0.8 },
    { path: '/article', freq: 'monthly' as const, priority: 0.6 },
    { path: '/about', freq: 'monthly' as const, priority: 0.5 },
  ]
  
  for (const cp of contentPaths) {
    if (!isExcluded(cp.path)) {
      urls.push({
        url: `${baseUrl}${cp.path}`,
        lastModified: now,
        changeFrequency: cp.freq,
        priority: cp.priority,
      })
    }
  }
  
  // 其他页面
  const otherPaths = [
    { path: '/contact', priority: 0.4 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
  ]
  
  for (const op of otherPaths) {
    if (!isExcluded(op.path)) {
      urls.push({
        url: `${baseUrl}${op.path}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: op.priority,
      })
    }
  }
  
  try {
    // 获取动态数据
    const [
      newsResult,
      hallOfFameResult,
      tagsResult,
    ] = await Promise.all([
      supabase
        .from('ai_news')
        .select('id, slug, updated_at, published_at')
        .eq('status', 'approved')
        .order('published_at', { ascending: false }),
      
      supabase
        .from('hall_of_fame')
        .select('id, updated_at')
        .eq('is_visible', true)
        .order('sort_order'),
      
      supabase
        .from('tags')
        .select('slug, created_at')
        .order('created_at', { ascending: false }),
    ])
    
    const news = newsResult.data || []
    const hallOfFame = hallOfFameResult.data || []
    const tags = tagsResult.data || []
    
    // 资讯详情页
    for (const item of news) {
      const detailPath = `/news/${item.slug || item.id}`
      if (!isExcluded(detailPath)) {
        urls.push({
          url: `${baseUrl}${detailPath}`,
          lastModified: item.published_at ? new Date(item.published_at) : (item.updated_at ? new Date(item.updated_at) : now),
          changeFrequency: 'weekly',
          priority: Math.min(defaultPriority + 0.2, 1),
        })
      }
    }
    
    // 名人堂详情页
    for (const person of hallOfFame) {
      const detailPath = `/hall-of-fame/${person.id}`
      if (!isExcluded(detailPath)) {
        urls.push({
          url: `${baseUrl}${detailPath}`,
          lastModified: person.updated_at ? new Date(person.updated_at) : now,
          changeFrequency: 'monthly',
          priority: Math.min(defaultPriority + 0.1, 1),
        })
      }
    }
    
    // 标签页
    for (const tag of tags) {
      const tagPath = `/tags/${tag.slug}`
      if (!isExcluded(tagPath)) {
        urls.push({
          url: `${baseUrl}${tagPath}`,
          lastModified: tag.created_at ? new Date(tag.created_at) : now,
          changeFrequency: 'weekly',
          priority: defaultPriority,
        })
      }
    }
    
    // 自定义URL
    const customUrls = seoConfig?.sitemap_custom_urls || []
    for (const item of customUrls as Array<{
      url: string;
      lastModified?: string;
      changeFrequency?: string;
      priority?: number;
    }>) {
      const customPath = item.url
      if (!isExcluded(customPath)) {
        urls.push({
          url: `${baseUrl}${customPath}`,
          lastModified: item.lastModified ? new Date(item.lastModified) : now,
          changeFrequency: getValidChangeFrequency(item.changeFrequency || 'weekly'),
          priority: item.priority ? parseFloat(item.priority.toString()) : defaultPriority,
        })
      }
    }
  } catch (error) {
    console.error('获取动态数据失败:', error)
  }
  
  // 生成XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
