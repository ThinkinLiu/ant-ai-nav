import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 公开获取网站设置（仅返回需要公开的字段）
export async function GET() {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('ranking_enabled, ranking_title, ranking_description, comments_enabled, favorites_enabled')
    .limit(1)
    .single()
  
  if (error) {
    // 返回默认值
    return NextResponse.json({
      ranking_enabled: true,
      ranking_title: 'AI工具排行榜',
      ranking_description: null,
      comments_enabled: true,
      favorites_enabled: true
    })
  }
  
  return NextResponse.json(data)
}
