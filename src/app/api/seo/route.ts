import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 公开获取SEO配置（用于前端动态读取）
export async function GET() {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .limit(1)
    .single()
  
  if (error) {
    // 返回默认配置
    return NextResponse.json({
      site_name: '蚂蚁AI导航',
      site_description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
      site_keywords: 'AI导航,AI工具,AI工具导航,AI写作,AI绘画,ChatGPT,Claude,Midjourney,人工智能',
      og_title: '蚂蚁AI导航 - 发现最好的AI工具',
      og_description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
      og_type: 'website',
      twitter_card: 'summary_large_image',
      robots_txt: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml'
    })
  }
  
  return NextResponse.json(data)
}
