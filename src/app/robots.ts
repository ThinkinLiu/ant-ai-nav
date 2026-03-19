import { MetadataRoute } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 强制动态生成，不在构建时预渲染
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayiai.site'
  
  const defaultRules = {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
  
  try {
    const supabase = getSupabaseClient()
    
    // 从数据库获取自定义robots.txt配置
    const { data: seoSettings } = await supabase
      .from('seo_settings')
      .select('robots_txt')
      .limit(1)
      .single()
    
    // 如果有自定义配置，可以在这里处理
    // 目前返回默认规则
    return defaultRules
  } catch (error) {
    // 数据库连接失败时返回默认规则
    return defaultRules
  }
}
