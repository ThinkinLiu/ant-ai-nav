import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取SEO配置
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
  
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json(
      { error: '获取SEO配置失败' },
      { status: 500 }
    )
  }
  
  // 默认配置
  const defaultConfigs = {
    nav: {
      site_type: 'nav',
      site_name: '蚂蚁AI导航',
      site_description: '蚂蚁AI导航是一个专注于AI工具的资源导航平台，帮助用户发现和使用最优秀的AI产品。',
      site_keywords: 'AI导航,AI工具,AI工具导航,AI写作,AI绘画,ChatGPT,Claude,Midjourney,人工智能',
      site_url: '',
      blog_logo: '',
      blog_name: '蚂蚁AI之家',
      blog_description: '探索AI技术的无限可能，掌握前沿AI工具的使用技巧',
      blog_url: '',
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
      custom_body_scripts: '',
      sitemap_enabled: true,
      sitemap_domain: '',
      sitemap_changefreq_default: 'weekly',
      sitemap_priority_default: '0.5',
      sitemap_exclude_paths: '',
      sitemap_custom_urls: null,
      copyright_enabled: true,
      copyright_year_start: 2024,
      copyright_year_end: 'current',
      copyright_text: '',
      copyright_company_name: '',
      copyright_company_email: '',
      copyright_icp: '',
      copyright_icp_url: '',
      copyright_police: '',
      copyright_police_url: '',
      copyright_additional: ''
    },
    home: {
      site_type: 'home',
      site_name: '蚂蚁AI之家',
      site_description: '蚂蚁AI之家是一个专注于AI技术和工具分享的博客平台，探索AI技术的无限可能，掌握前沿AI工具的使用技巧。',
      site_keywords: 'AI之家,AI博客,AI教程,AI工具,ChatGPT使用,AI绘画教程,AI写作技巧,人工智能',
      site_url: '',
      og_title: '蚂蚁AI之家 - 探索AI技术的无限可能',
      og_description: '蚂蚁AI之家是一个专注于AI技术和工具分享的博客平台，探索AI技术的无限可能，掌握前沿AI工具的使用技巧。',
      og_image: '',
      og_type: 'website',
      twitter_card: 'summary_large_image',
      twitter_site: '',
      twitter_creator: '',
      structured_data: null,
      robots_txt: 'User-agent: *\nAllow: /\nSitemap: /sitemap-home.xml',
      google_site_verification: '',
      baidu_site_verification: '',
      google_analytics_id: '',
      baidu_analytics_id: '',
      la_analytics_id: '',
      custom_head_scripts: '',
      custom_body_scripts: '',
      sitemap_enabled: true,
      sitemap_domain: '',
      sitemap_changefreq_default: 'weekly',
      sitemap_priority_default: '0.5',
      sitemap_exclude_paths: '',
      sitemap_custom_urls: null,
      copyright_enabled: true,
      copyright_year_start: 2024,
      copyright_year_end: 'current',
      copyright_text: '',
      copyright_company_name: '',
      copyright_company_email: '',
      copyright_icp: '',
      copyright_icp_url: '',
      copyright_police: '',
      copyright_police_url: '',
      copyright_additional: ''
    }
  }
  
  // 如果没有配置，返回默认值
  if (!data) {
    return NextResponse.json({
      data: defaultConfigs[siteType as keyof typeof defaultConfigs] || defaultConfigs.nav
    })
  }
  
  return NextResponse.json({ data })
}

// 更新SEO配置
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { searchParams } = new URL(request.url)
  const siteType = searchParams.get('site_type') || body.site_type || 'nav'
  
  // 检查是否存在该站点的配置
  const { data: existing } = await supabase
    .from('seo_settings')
    .select('id')
    .eq('site_type', siteType)
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
        blog_logo: body.blog_logo,
        blog_name: body.blog_name,
        blog_description: body.blog_description,
        blog_url: body.blog_url,
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
        sitemap_enabled: body.sitemap_enabled,
        sitemap_domain: body.sitemap_domain,
        sitemap_changefreq_default: body.sitemap_changefreq_default,
        sitemap_priority_default: body.sitemap_priority_default,
        sitemap_exclude_paths: body.sitemap_exclude_paths,
        sitemap_custom_urls: body.sitemap_custom_urls,
        copyright_enabled: body.copyright_enabled,
        copyright_year_start: body.copyright_year_start,
        copyright_year_end: body.copyright_year_end,
        copyright_text: body.copyright_text,
        copyright_company_name: body.copyright_company_name,
        copyright_company_email: body.copyright_company_email,
        copyright_icp: body.copyright_icp,
        copyright_icp_url: body.copyright_icp_url,
        copyright_police: body.copyright_police,
        copyright_police_url: body.copyright_police_url,
        copyright_additional: body.copyright_additional,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    // 创建新记录
    result = await supabase
      .from('seo_settings')
      .insert({
        site_type: siteType,
        site_name: body.site_name,
        site_description: body.site_description,
        site_keywords: body.site_keywords,
        site_url: body.site_url,
        blog_logo: body.blog_logo,
        blog_name: body.blog_name,
        blog_description: body.blog_description,
        blog_url: body.blog_url,
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
        sitemap_enabled: body.sitemap_enabled,
        sitemap_domain: body.sitemap_domain,
        sitemap_changefreq_default: body.sitemap_changefreq_default,
        sitemap_priority_default: body.sitemap_priority_default,
        sitemap_exclude_paths: body.sitemap_exclude_paths,
        sitemap_custom_urls: body.sitemap_custom_urls,
        copyright_enabled: body.copyright_enabled,
        copyright_year_start: body.copyright_year_start,
        copyright_year_end: body.copyright_year_end,
        copyright_text: body.copyright_text,
        copyright_company_name: body.copyright_company_name,
        copyright_company_email: body.copyright_company_email,
        copyright_icp: body.copyright_icp,
        copyright_icp_url: body.copyright_icp_url,
        copyright_police: body.copyright_police,
        copyright_police_url: body.copyright_police_url,
        copyright_additional: body.copyright_additional
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
