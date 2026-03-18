import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 更新友情链接（审核/编辑）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { 
      status, 
      rejectReason, 
      sortOrder,
      // 编辑字段
      name,
      url,
      description,
      logo,
      contact_email,
      contact_name,
    } = body

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

    // 状态更新
    if (status) {
      updateData.status = status
      if (status === 'rejected' && rejectReason) {
        updateData.reject_reason = rejectReason
      }
    }

    // 排序更新
    if (sortOrder !== undefined) {
      updateData.sort_order = sortOrder
    }

    // 编辑字段更新
    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { success: false, error: '网站名称不能为空' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (url !== undefined) {
      if (!url.trim()) {
        return NextResponse.json(
          { success: false, error: '网站地址不能为空' },
          { status: 400 }
        )
      }
      // 验证 URL 格式
      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { success: false, error: '网站地址格式不正确' },
          { status: 400 }
        )
      }
      updateData.url = url.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    if (logo !== undefined) {
      updateData.logo = logo?.trim() || null
    }

    if (contact_email !== undefined) {
      updateData.contact_email = contact_email?.trim() || null
    }

    if (contact_name !== undefined) {
      updateData.contact_name = contact_name?.trim() || null
    }

    // 更新
    const { data, error } = await client
      .from('friend_links')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: status === 'approved' ? '审核通过' : status === 'rejected' ? '已拒绝' : '更新成功',
    })
  } catch (error) {
    console.error('更新友情链接错误:', error)
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
