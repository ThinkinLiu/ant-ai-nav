import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getEnv } from '@/lib/env-config'

/**
 * 获取主域名配置（同步版本）
 */
function getMainDomain(): string | null {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_MAIN_DOMAIN) {
    return process.env.NEXT_PUBLIC_MAIN_DOMAIN
  }
  return null
}

/**
 * 获取主域名（从当前请求提取）
 */
function extractMainDomain(hostname: string): string {
  const parts = hostname.split('.')
  
  // 如果是 localhost，返回 localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return hostname
  }
  
  // 如果是 IP 地址，返回原值
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname
  }
  
  // 如果是域名，返回主域名（最后两部分，带点前缀）
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`
  }
  
  return hostname
}

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

    // 获取主域名
    const configuredMainDomain = getMainDomain()
    const requestHostname = request.headers.get('host')?.split(':')[0] || 'localhost'
    const mainDomain = configuredMainDomain || extractMainDomain(requestHostname)

    console.log('[登录] 主域名配置:', {
      configuredMainDomain,
      requestHostname,
      mainDomain,
    })

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
        // 返回主域名信息，用于前端跨域设置
        mainDomain: mainDomain,
      },
    })

    // 设置 Supabase SSR 所需的 cookie
    if (authData.session) {
      const { access_token, refresh_token } = authData.session
      const isProduction = process.env.NODE_ENV === 'production'
      const cookieMaxAge = 60 * 60 * 24 * 7 // 7 天

      // 设置访问令牌 cookie
      response.cookies.set('sb-access-token', access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
        // 设置主域名（用于子域名共享）
        domain: mainDomain !== 'localhost' && mainDomain !== requestHostname ? mainDomain : undefined,
      })

      // 设置刷新令牌 cookie
      response.cookies.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
        // 设置主域名（用于子域名共享）
        domain: mainDomain !== 'localhost' && mainDomain !== requestHostname ? mainDomain : undefined,
      })

      // 同时设置 auth_token cookie（用于自定义认证逻辑）
      response.cookies.set('auth_token', access_token, {
        httpOnly: false, // 前端需要读取
        secure: isProduction,
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
        // 设置主域名（用于子域名共享）
        domain: mainDomain !== 'localhost' && mainDomain !== requestHostname ? mainDomain : undefined,
      })

      console.log('[登录] Cookie 设置完成:', {
        mainDomain,
        isSubdomain: mainDomain !== 'localhost' && mainDomain !== requestHostname,
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
