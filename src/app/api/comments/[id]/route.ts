import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 更新评论（管理员设置精选状态）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查管理员权限
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      )
    }

    // 获取评论
    const { data: comment } = await client
      .from('comments')
      .select('id')
      .eq('id', parseInt(id))
      .single()

    if (!comment) {
      return NextResponse.json(
        { success: false, error: '评论不存在' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: Record<string, any> = {}

    if (body.isFeatured !== undefined) {
      updateData.is_featured = body.isFeatured
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '没有需要更新的字段' },
        { status: 400 }
      )
    }

    const { data: updatedComment, error } = await client
      .from('comments')
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
      data: updatedComment,
    })
  } catch (error) {
    console.error('更新评论错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 获取评论
    const { data: comment } = await client
      .from('comments')
      .select('user_id')
      .eq('id', parseInt(id))
      .single()

    if (!comment) {
      return NextResponse.json(
        { success: false, error: '评论不存在' },
        { status: 404 }
      )
    }

    // 检查权限：只能删除自己的评论
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (comment.user_id !== user.id && userData?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限删除此评论' },
        { status: 403 }
      )
    }

    // 删除评论（会级联删除回复）
    const { error } = await client
      .from('comments')
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
      message: '评论已删除',
    })
  } catch (error) {
    console.error('删除评论错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
