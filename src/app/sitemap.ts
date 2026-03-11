import { MetadataRoute } from 'next'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://antai.example.com'
  
  // 获取所有已审核通过的工具
  const { data: tools } = await supabase
    .from('ai_tools')
    .select('slug, updated_at')
    .eq('status', 'approved')
    .order('updated_at', { ascending: false })
  
  // 获取所有分类
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true)
  
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ranking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]
  
  // 工具详情页
  const toolPages: MetadataRoute.Sitemap = (tools || []).map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: tool.updated_at ? new Date(tool.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  // 分类页
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
  
  return [...staticPages, ...toolPages, ...categoryPages]
}
