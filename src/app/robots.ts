import { MetadataRoute } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const supabase = getSupabaseClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mayiai.site'
  
  // 从数据库获取自定义robots.txt配置
  const { data: seoSettings } = await supabase
    .from('seo_settings')
    .select('robots_txt')
    .limit(1)
    .single()
  
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
  
  return defaultRules
}
