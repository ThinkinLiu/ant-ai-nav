import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取SEO配置
export async function GET() {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('seo_settings')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json(
      { error: '获取SEO配置失败' },
      { status: 500 }
    )
  }
  
  // 如果没有配置，返回默认值
  if (!data) {
    return NextResponse.json({
      data: {
        site_name: '蚂蚁AI导航',
        site_description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
        site_keywords: 'AI导航,AI工具,AI工具导航,AI写作,AI绘画,ChatGPT,Claude,Midjourney,人工智能',
        site_url: '',
        og_title: '蚂蚁AI导航 - 发现最好的AI工具',
        og_description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
        og_image: '',
        og_type: 'website',
        twitter_card: 'summary_large_image',
        twitter_site: '',
        twitter_creator: '',
        structured_data: null,
        robots_txt: 'User-agent: *\nAllow: /\nSitemap: /sitemap.xml',
        google_site_verification: '',
        baidu_site_verification: '',
        google_analytics_id: '',
        baidu_analytics_id: '',
        la_analytics_id: '',
        custom_head_scripts: '',
        custom_body_scripts: ''
      }
    })
  }
  
  return NextResponse.json({ data })
}

// 更新SEO配置
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  
  // 检查是否存在配置
  const { data: existing } = await supabase
    .from('seo_settings')
    .select('id')
    .limit(1)
    .single()
  
  let result
  
  if (existing) {
    // 更新
    result = await supabase
      .from('seo_settings')
      .update({
        site_name: body.site_name,
        site_description: body.site_description,
        site_keywords: body.site_keywords,
        site_url: body.site_url,
        og_title: body.og_title,
        og_description: body.og_description,
        og_image: body.og_image,
        og_type: body.og_type,
        twitter_card: body.twitter_card,
        twitter_site: body.twitter_site,
        twitter_creator: body.twitter_creator,
        structured_data: body.structured_data,
        robots_txt: body.robots_txt,
        google_site_verification: body.google_site_verification,
        baidu_site_verification: body.baidu_site_verification,
        google_analytics_id: body.google_analytics_id,
        baidu_analytics_id: body.baidu_analytics_id,
        la_analytics_id: body.la_analytics_id,
        custom_head_scripts: body.custom_head_scripts,
        custom_body_scripts: body.custom_body_scripts,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    // 创建
    result = await supabase
      .from('seo_settings')
      .insert({
        site_name: body.site_name,
        site_description: body.site_description,
        site_keywords: body.site_keywords,
        site_url: body.site_url,
        og_title: body.og_title,
        og_description: body.og_description,
        og_image: body.og_image,
        og_type: body.og_type,
        twitter_card: body.twitter_card,
        twitter_site: body.twitter_site,
        twitter_creator: body.twitter_creator,
        structured_data: body.structured_data,
        robots_txt: body.robots_txt,
        google_site_verification: body.google_site_verification,
        baidu_site_verification: body.baidu_site_verification,
        google_analytics_id: body.google_analytics_id,
        baidu_analytics_id: body.baidu_analytics_id,
        la_analytics_id: body.la_analytics_id,
        custom_head_scripts: body.custom_head_scripts,
        custom_body_scripts: body.custom_body_scripts
      })
      .select()
      .single()
  }
  
  if (result.error) {
    return NextResponse.json(
      { error: '保存SEO配置失败' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ data: result.data })
}
