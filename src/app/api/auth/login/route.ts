import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    
    // 使用 Supabase Auth 登录
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: '登录失败' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const { data: userData } = await client
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return NextResponse.json({
      success: true,
      data: {
        user: userData || {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || email.split('@')[0],
          role: 'user',
        },
        session: authData.session,
      },
    })
  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
