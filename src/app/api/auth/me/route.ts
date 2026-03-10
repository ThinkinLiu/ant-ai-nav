import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未登录' },
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

    // 获取用户详细信息
    const { data: userData } = await client
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      data: userData || {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        role: 'user',
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
