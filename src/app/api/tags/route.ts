import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取所有标签
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data: tags, error } = await supabase
      .from('tags')
      .select('id, name, slug, created_at')
      .order('name', { ascending: true })
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
