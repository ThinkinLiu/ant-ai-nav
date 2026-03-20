import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 审核AI资讯
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, rejectReason } = body

    // 验证状态
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '无效的审核状态' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()

    // 检查资讯是否存在
    const { data: existing } = await client
      .from('ai_news')
      .select('id, status')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      )
    }

    // 构建更新对象
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // 如果是拒绝，记录原因
    if (status === 'rejected' && rejectReason) {
      updateData.reject_reason = rejectReason
    }

    // 如果是通过，设置发布时间
    if (status === 'approved') {
      updateData.published_at = new Date().toISOString()
    }

    // 更新资讯
    const { data, error } = await client
      .from('ai_news')
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
      data,
    })
  } catch (error) {
    console.error('审核AI资讯错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 提交审核
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const client = getSupabaseClient()

    // 检查资讯是否存在
    const { data: existing } = await client
      .from('ai_news')
      .select('id, status')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '资讯不存在' },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: '只能提交草稿状态的资讯' },
        { status: 400 }
      )
    }

    // 更新状态为待审核
    const { data, error } = await client
      .from('ai_news')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
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
      data,
    })
  } catch (error) {
    console.error('提交审核错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
