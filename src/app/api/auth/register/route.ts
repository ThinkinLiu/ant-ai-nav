import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码不能为空' },
        { status: 400 }
      )
    }

    const client = getSupabaseClient()
    
    // 使用 Supabase Auth 注册
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: '注册失败' },
        { status: 400 }
      )
    }

    // 创建用户记录
    const { error: dbError } = await client
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: name || email.split('@')[0],
        role: 'user',
        is_active: true,
      })

    if (dbError) {
      console.error('创建用户记录失败:', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name || email.split('@')[0],
        },
        session: authData.session,
      },
    })
  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
