import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取所有公告（后台管理使用）
 */
export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
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

/**
 * 创建公告
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    
    const { title, content, link_url, is_active, sort_order, expire_at } = body
    
    if (!title) {
      return NextResponse.json(
        { success: false, error: '标题为必填项' },
        { status: 400 }
      )
    }
    
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content: content || null,
        link_url: link_url || null,
        is_active: is_active ?? true,
        sort_order: sort_order || 0,
        expire_at: expire_at || null,
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: announcement,
    })
  } catch (error) {
    console.error('创建公告失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
