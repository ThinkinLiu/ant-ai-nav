import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 切换AI资讯推荐状态
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 获取当前资讯
    const { data: news, error: fetchError } = await client
      .from('ai_news')
      .select('id, is_featured')
      .eq('id', parseInt(id))
      .single()

    if (fetchError || !news) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      )
    }

    // 切换推荐状态
    const { data, error } = await client
      .from('ai_news')
      .update({ is_featured: !news.is_featured })
      .eq('id', parseInt(id))
      .select('id, title, is_featured')
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: news.is_featured ? '已取消推荐' : '已设为推荐',
    })
  } catch (error) {
    console.error('切换推荐状态错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
