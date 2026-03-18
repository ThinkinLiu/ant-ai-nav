import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * 获取单个公告
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    
    const { data: announcement, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', parseInt(id))
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
    console.error('获取公告失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 更新公告
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    const body = await request.json()
    
    const { title, content, link_url, is_active, sort_order, expire_at } = body
    
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (link_url !== undefined) updateData.link_url = link_url
    if (is_active !== undefined) updateData.is_active = is_active
    if (sort_order !== undefined) updateData.sort_order = sort_order
    if (expire_at !== undefined) updateData.expire_at = expire_at
    
    const { data: announcement, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', parseInt(id))
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
    console.error('更新公告失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 删除公告
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', parseInt(id))
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除公告失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
