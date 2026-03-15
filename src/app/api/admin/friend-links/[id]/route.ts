import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 审核友情链接（通过/拒绝）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, rejectReason, sortOrder } = body

    const client = getSupabaseClient()

    // 检查是否存在
    const { data: existing } = await client
      .from('friend_links')
      .select('id, status')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '友情链接不存在' },
        { status: 404 }
      )
    }

    // 构建更新对象
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status
      if (status === 'rejected' && rejectReason) {
        updateData.reject_reason = rejectReason
      }
    }

    if (sortOrder !== undefined) {
      updateData.sort_order = sortOrder
    }

    // 更新
    const { error } = await client
      .from('friend_links')
      .update(updateData)
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? '审核通过' : status === 'rejected' ? '已拒绝' : '更新成功',
    })
  } catch (error) {
    console.error('审核友情链接错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除友情链接
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    const { error } = await client
      .from('friend_links')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除友情链接错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
