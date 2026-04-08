import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 公开获取网站设置（仅返回需要公开的字段）
export async function GET() {
  const supabase = getSupabaseClient()

  // 获取 site_settings
  const { data: siteSettings, error: siteSettingsError } = await supabase
    .from('site_settings')
    .select('ranking_enabled, ranking_title, ranking_description, comments_enabled, favorites_enabled')
    .limit(1)
    .single()

  // 获取 seo_settings 中的 site_url 和博客相关设置
  const { data: seoSettings } = await supabase
    .from('seo_settings')
    .select('site_url, blog_logo, blog_name, blog_description, blog_url')
    .limit(1)
    .single()

  if (siteSettingsError) {
    // 返回默认值
    return NextResponse.json({
      ranking_enabled: true,
      ranking_title: 'AI工具排行榜',
      ranking_description: null,
      comments_enabled: true,
      favorites_enabled: true,
      site_url: seoSettings?.site_url || null,
      blog_logo: seoSettings?.blog_logo || null,
      blog_name: seoSettings?.blog_name || '蚂蚁AI之家',
      blog_description: seoSettings?.blog_description || '探索AI技术的无限可能，掌握前沿AI工具的使用技巧',
      blog_url: seoSettings?.blog_url || null
    })
  }

  return NextResponse.json({
    ...siteSettings,
    site_url: seoSettings?.site_url || null,
    blog_logo: seoSettings?.blog_logo || null,
    blog_name: seoSettings?.blog_name || '蚂蚁AI之家',
    blog_description: seoSettings?.blog_description || '探索AI技术的无限可能，掌握前沿AI工具的使用技巧',
    blog_url: seoSettings?.blog_url || null
  })
}
