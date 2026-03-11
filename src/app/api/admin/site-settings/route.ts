import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取网站设置
export async function GET() {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json(
      { error: '获取网站设置失败' },
      { status: 500 }
    )
  }
  
  // 如果没有配置，返回默认值
  if (!data) {
    return NextResponse.json({
      data: {
        ranking_enabled: true,
        ranking_title: 'AI工具排行榜',
        ranking_description: '基于真实流量数据的AI工具排行榜',
        comments_enabled: true,
        favorites_enabled: true
      }
    })
  }
  
  return NextResponse.json({ data })
}

// 更新网站设置
export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  
  // 检查是否存在配置
  const { data: existing } = await supabase
    .from('site_settings')
    .select('id')
    .limit(1)
    .single()
  
  let result
  
  const updateData: any = {
    updated_at: new Date().toISOString()
  }
  
  if (body.ranking_enabled !== undefined) {
    updateData.ranking_enabled = body.ranking_enabled
  }
  if (body.ranking_title !== undefined) {
    updateData.ranking_title = body.ranking_title
  }
  if (body.ranking_description !== undefined) {
    updateData.ranking_description = body.ranking_description
  }
  if (body.comments_enabled !== undefined) {
    updateData.comments_enabled = body.comments_enabled
  }
  if (body.favorites_enabled !== undefined) {
    updateData.favorites_enabled = body.favorites_enabled
  }
  
  if (existing) {
    // 更新
    result = await supabase
      .from('site_settings')
      .update(updateData)
      .eq('id', existing.id)
      .select()
      .single()
  } else {
    // 创建
    result = await supabase
      .from('site_settings')
      .insert({
        ranking_enabled: body.ranking_enabled ?? true,
        ranking_title: body.ranking_title ?? 'AI工具排行榜',
        ranking_description: body.ranking_description,
        comments_enabled: body.comments_enabled ?? true,
        favorites_enabled: body.favorites_enabled ?? true
      })
      .select()
      .single()
  }
  
  if (result.error) {
    return NextResponse.json(
      { error: '保存网站设置失败' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ data: result.data })
}
