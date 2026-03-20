import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * 获取标签关联的资讯列表
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }
    
    const supabase = getSupabaseClient()
    
    // 获取标签关联的资讯ID
    const { data: newsTags, error: newsTagsError } = await supabase
      .from('news_tags')
      .select('news_id')
      .eq('tag_id', parseInt(id))
    
    if (newsTagsError) {
      return NextResponse.json(
        { success: false, error: newsTagsError.message },
        { status: 400 }
      )
    }
    
    if (!newsTags || newsTags.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }
    
    const newsIds = newsTags.map(nt => nt.news_id)
    
    // 获取资讯详情（category 是字符串字段，直接返回分类名称）
    const { data: news, error: newsError } = await supabase
      .from('ai_news')
      .select('id, title, slug, summary, cover_image, source, view_count, status, created_at, category')
      .in('id', newsIds)
      .order('created_at', { ascending: false })
    
    if (newsError) {
      return NextResponse.json(
        { success: false, error: newsError.message },
        { status: 400 }
      )
    }
    
    // 组装数据，category 直接作为分类名称
    const newsWithCategory = (news || []).map(item => ({
      ...item,
      categoryName: item.category || null,
    }))
    
    return NextResponse.json({
      success: true,
      data: newsWithCategory,
    })
  } catch (error) {
    console.error('获取标签关联资讯失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
