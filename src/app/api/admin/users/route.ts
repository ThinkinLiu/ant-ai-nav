import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取用户列表（管理员）
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '无效的登录状态' }, { status: 401 })
    }

    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const status = searchParams.get('status') // active, inactive, all

    let query = client
      .from('users')
      .select('*', { count: 'exact' })

    if (role) {
      query = query.eq('role', role)
    }

    // 状态筛选
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: { data: users, total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    })
  } catch (error) {
    console.error('获取用户列表错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// 更新用户角色
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '无效的登录状态' }, { status: 401 })
    }

    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role, isActive } = body

    // 更新用户角色
    if (role) {
      const { error } = await client
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }
    }

    // 更新用户状态（启用/停用）
    if (typeof isActive === 'boolean') {
      const { error } = await client
        .from('users')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true, message: '更新成功' })
  } catch (error) {
    console.error('更新用户错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// 删除用户（管理员）
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: '无效的登录状态' }, { status: 401 })
    }

    // 检查是否为管理员
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    // 获取要删除的用户邮箱
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, error: '缺少邮箱参数' }, { status: 400 })
    }

    // 使用 Supabase Admin API 删除用户
    // 需要获取 SERVICE_ROLE 密钥
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ADMIN_KEY

    if (!serviceRoleKey) {
      return NextResponse.json({ success: false, error: '未配置管理员密钥' }, { status: 500 })
    }

    // 获取 Supabase 配置（支持 NEXT_PUBLIC_ 和 COZE_ 前缀）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL

    if (!supabaseUrl) {
      return NextResponse.json({ success: false, error: '未配置 Supabase URL' }, { status: 500 })
    }

    // 先通过邮箱查找用户 ID
    const listResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    })

    if (!listResponse.ok) {
      return NextResponse.json({ success: false, error: '获取用户列表失败' }, { status: 400 })
    }

    const usersData = await listResponse.json()
    const targetUser = usersData.users?.find((u: { email: string }) => u.email === email)

    if (!targetUser) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }

    // 通过用户 ID 删除
    const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUser.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
      },
    })

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text()
      console.error('Supabase Admin API 错误:', errorText)
      return NextResponse.json({ success: false, error: '删除用户失败' }, { status: 400 })
    }

    // 同时删除 users 表中的记录
    const { error: deleteError } = await client
      .from('users')
      .delete()
      .eq('email', email)

    if (deleteError) {
      console.error('删除 users 表记录错误:', deleteError)
    }

    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('删除用户错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
