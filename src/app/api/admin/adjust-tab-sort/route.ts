import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 调整Tab排序，确保热门教程在热点资讯之前
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient()
    
    // 调整排序
    const { error: update1 } = await client
      .from('home_tabs')
      .update({ sort_order: 4 })
      .eq('slug', 'tutorials')
    
    if (update1) {
      return NextResponse.json(
        { success: false, error: update1.message },
        { status: 400 }
      )
    }
    
    const { error: update2 } = await client
      .from('home_tabs')
      .update({ sort_order: 5 })
      .eq('slug', 'news')
    
    if (update2) {
      return NextResponse.json(
        { success: false, error: update2.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '已调整Tab排序，热门教程现在在热点资讯之前'
    })
  } catch (error) {
    console.error('调整Tab排序错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
