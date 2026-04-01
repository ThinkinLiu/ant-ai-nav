import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 审批工具 - 修改工具状态
 * 仅管理员可用
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: toolId } = await params

    // 验证登录状态
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 获取当前用户
    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查用户角色（仅管理员可操作）
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '只有管理员可以进行审批操作' },
        { status: 403 }
      )
    }

    // 获取请求体
    const body = await request.json()
    const { status, rejectReason } = body

    // 验证状态值
    const validStatuses = ['pending', 'approved', 'rejected']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: '无效的状态值' },
        { status: 400 }
      )
    }

    // 如果是拒绝，必须填写原因
    if (status === 'rejected' && !rejectReason?.trim()) {
      return NextResponse.json(
        { success: false, error: '拒绝时必须填写拒绝原因' },
        { status: 400 }
      )
    }

    // 更新工具状态
    const updateData: { status: string; reject_reason?: string | null } = { status }
    
    // 处理拒绝原因
    if (status === 'rejected') {
      updateData.reject_reason = rejectReason.trim()
    } else {
      // 其他状态清除拒绝原因
      updateData.reject_reason = null
    }

    const { error: updateError } = await client
      .from('ai_tools')
      .update(updateData)
      .eq('id', parseInt(toolId))

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '状态更新成功',
    })
  } catch (error) {
    console.error('审批工具错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
