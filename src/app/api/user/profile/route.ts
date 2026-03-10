import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取当前用户详细信息
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

    // 获取用户详细信息
    const { data: userData, error } = await client
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 获取用户统计数据
    const [favoritesResult, commentsResult] = await Promise.all([
      client
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      client
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
    ])

    return NextResponse.json({
      success: true,
      data: {
        ...userData,
        password: undefined,
        stats: {
          favoritesCount: favoritesResult.count || 0,
          commentsCount: commentsResult.count || 0,
        }
      },
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新用户信息
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

    const { data: { user }, error: authError } = await client.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, avatar } = body

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (name) updateData.name = name
    if (avatar) updateData.avatar = avatar

    const { data: updatedUser, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', user.id)
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
      data: {
        ...updatedUser,
        password: undefined,
      },
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
