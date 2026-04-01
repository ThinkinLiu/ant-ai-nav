import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取有效的公告列表（前端使用）
 * 只返回is_active=true且未过期的公告
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const now = new Date().toISOString()
    
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`expire_at.is.null,expire_at.gt.${now}`)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: announcements,
    })
  } catch (error) {
    console.error('获取公告失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
