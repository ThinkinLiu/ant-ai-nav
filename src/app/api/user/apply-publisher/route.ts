import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 申请成为发布者
 */
export async function POST(request: NextRequest) {
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

    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 获取当前用户信息
    const { data: userData, error: userError } = await client
      .from('users')
      .select('id, role, name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查是否已经是发布者或管理员
    if (userData.role === 'publisher') {
      return NextResponse.json(
        { success: false, error: '您已经是发布者了' },
        { status: 400 }
      )
    }

    if (userData.role === 'admin') {
      return NextResponse.json(
        { success: false, error: '管理员无需申请' },
        { status: 400 }
      )
    }

    // 获取申请信息
    const body = await request.json()
    const { reason, contact, website } = body

    // 验证必填字段
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: '请填写申请理由（至少10个字符）' },
        { status: 400 }
      )
    }

    // 检查是否有待审核的申请
    const { data: existingApply } = await client
      .from('publisher_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (existingApply) {
      return NextResponse.json(
        { success: false, error: '您已有待审核的申请，请耐心等待' },
        { status: 400 }
      )
    }

    // 创建申请记录
    const { data: application, error: applyError } = await client
      .from('publisher_applications')
      .insert({
        user_id: user.id,
        reason: reason.trim(),
        contact: contact?.trim() || null,
        website: website?.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (applyError) {
      // 如果表不存在，直接将用户升级为发布者（简化流程）
      if (applyError.code === '42P01') {
        // 直接更新用户角色
        const { error: updateError } = await client
          .from('users')
          .update({ 
            role: 'publisher',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (updateError) {
          return NextResponse.json(
            { success: false, error: updateError.message },
            { status: 400 }
          )
        }

        return NextResponse.json({
          success: true,
          message: '恭喜！您已成为发布者',
          data: { directUpgrade: true },
        })
      }

      return NextResponse.json(
        { success: false, error: applyError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '申请已提交，请耐心等待审核',
      data: application,
    })
  } catch (error) {
    console.error('申请发布者错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 获取申请状态
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

    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 获取用户信息
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // 如果已经是发布者，返回已通过状态
    if (userData?.role === 'publisher' || userData?.role === 'admin') {
      return NextResponse.json({
        success: true,
        data: {
          status: 'approved',
          message: '您已经是发布者',
        }
      })
    }

    // 查询申请记录
    const { data: application, error } = await client
      .from('publisher_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有申请记录
        return NextResponse.json({
          success: true,
          data: {
            status: 'none',
            message: '暂无申请记录',
          }
        })
      }
      // 表不存在的情况
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          data: {
            status: 'direct',
            message: '可直接申请',
          }
        })
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: application,
    })
  } catch (error) {
    console.error('获取申请状态错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
