import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 删除资讯与标签的关联
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const newsId = parseInt(id)
    const supabase = getSupabaseClient()
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { tagId } = body
    
    if (!tagId) {
      return NextResponse.json(
        { success: false, error: '缺少标签ID' },
        { status: 400 }
      )
    }
    
    // 删除关联
    const { error } = await supabase
      .from('news_tags')
      .delete()
      .eq('news_id', newsId)
      .eq('tag_id', tagId)
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '关联已删除',
    })
  } catch (error) {
    console.error('删除资讯标签关联失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
