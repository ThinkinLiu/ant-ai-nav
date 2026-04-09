import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getEnv } from '@/lib/env-config'

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

    // 获取 Supabase 配置
    const supabaseUrl = getEnv([
      'NEXT_PUBLIC_SUPABASE_URL',
      'COZE_SUPABASE_URL',
      'SUPABASE_URL',
    ])

    const supabaseAnonKey = getEnv([
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'COZE_SUPABASE_ANON_KEY',
      'SUPABASE_ANON_KEY',
    ])

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误' },
        { status: 500 }
      )
    }

    // 创建 Supabase SSR Server Client
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
        },
      },
    })

    // 使用 Supabase Auth 登录
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // 构建响应，并设置 cookie
    const response = NextResponse.json({
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

    // 设置 Supabase SSR 所需的 cookie
    if (authData.session) {
      const { access_token, refresh_token } = authData.session

      // 设置访问令牌 cookie
      response.cookies.set('sb-access-token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: '/',
      })

      // 设置刷新令牌 cookie
      response.cookies.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
