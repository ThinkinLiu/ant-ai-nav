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

    let query = client
      .from('users')
      .select('*', { count: 'exact' })

    if (role) {
      query = query.eq('role', role)
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
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
    }

    const { error } = await client
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: '更新成功' })
  } catch (error) {
    console.error('更新用户角色错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
