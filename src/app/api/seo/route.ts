import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 公开获取SEO配置（用于前端动态读取）
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(request.url)
  const siteType = searchParams.get('site_type') || 'nav'
  
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .eq('site_type', siteType)
    .limit(1)
    .single()
  
  // 默认配置
  const defaultConfigs: Record<string, any> = {
    nav: {
      site_name: '蚂蚁AI导航',
      site_description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
      site_keywords: 'AI导航,AI工具,AI工具导航,AI写作,AI绘画,ChatGPT,Claude,Midjourney,人工智能',
      og_title: '蚂蚁AI导航 - 发现最好的AI工具',
      og_description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
      og_type: 'website',
      twitter_card: 'summary_large_image',
      robots_txt: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml'
    },
    home: {
      site_name: '蚂蚁AI之家',
      site_description: '蚂蚁AI之家是一个专注于AI技术和工具分享的博客平台，探索AI技术的无限可能，掌握前沿AI工具的使用技巧。',
      site_keywords: 'AI之家,AI博客,AI教程,AI工具,ChatGPT使用,AI绘画教程,AI写作技巧,人工智能',
      og_title: '蚂蚁AI之家 - 探索AI技术的无限可能',
      og_description: '蚂蚁AI之家是一个专注于AI技术和工具分享的博客平台，探索AI技术的无限可能，掌握前沿AI工具的使用技巧。',
      og_type: 'website',
      twitter_card: 'summary_large_image',
      robots_txt: 'User-agent: *\nAllow: /\nSitemap: /sitemap-home.xml'
    }
  }
  
  if (error) {
    // 返回默认配置
    return NextResponse.json(
      defaultConfigs[siteType] || defaultConfigs.nav
    )
  }
  
  return NextResponse.json(data)
}
