import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取发布者申请列表（管理员专用）
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 验证管理员权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    // 分页
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // 构建查询
    let query = client
      .from('publisher_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取申请人信息
    const userIds = [...new Set(data?.map(a => a.user_id) || [])]
    const { data: users } = await client
      .from('users')
      .select('id, name, email, avatar, created_at')
      .in('id', userIds)

    // 获取审核人信息
    const reviewerIds = [...new Set(data?.filter(a => a.reviewed_by).map(a => a.reviewed_by) || [])]
    let reviewers: any[] = []
    if (reviewerIds.length > 0) {
      const { data: reviewerData } = await client
        .from('users')
        .select('id, name')
        .in('id', reviewerIds)
      reviewers = reviewerData || []
    }

    // 组装数据
    const applications = (data || []).map(app => ({
      ...app,
      user: users?.find(u => u.id === app.user_id) || null,
      reviewer: reviewers?.find(r => r.id === app.reviewed_by) || null
    }))

    return NextResponse.json({
      success: true,
      data: {
        data: applications,
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('获取申请列表错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 审核发布者申请（管理员专用）
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 验证管理员权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { applicationId, action, reviewNote } = body

    if (!applicationId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '参数错误' },
        { status: 400 }
      )
    }

    // 获取申请记录
    const { data: application, error: fetchError } = await client
      .from('publisher_applications')
      .select('*')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { success: false, error: '申请不存在' },
        { status: 404 }
      )
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: '该申请已处理' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // 更新申请状态
    const { error: updateError } = await client
      .from('publisher_applications')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: reviewNote || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 400 }
      )
    }

    // 如果通过，更新用户角色
    if (action === 'approve') {
      const { error: roleError } = await client
        .from('users')
        .update({
          role: 'publisher',
          updated_at: new Date().toISOString()
        })
        .eq('id', application.user_id)

      if (roleError) {
        console.error('更新用户角色失败:', roleError)
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '已通过申请' : '已拒绝申请'
    })
  } catch (error) {
    console.error('审核申请错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
