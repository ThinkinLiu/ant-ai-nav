import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getEnv } from '@/lib/env-config'

/**
 * 获取所有主域名配置（支持多个）
 */
function getMainDomains(): string[] {
  const domains: string[] = []
  
  // 优先使用环境变量（多个域名）
  if (process.env.NEXT_PUBLIC_MAIN_DOMAINS) {
    domains.push(...process.env.NEXT_PUBLIC_MAIN_DOMAINS.split(',').map(d => d.trim()))
  }
  
  // 兼容单个域名
  if (process.env.NEXT_PUBLIC_MAIN_DOMAIN) {
    if (!domains.includes(process.env.NEXT_PUBLIC_MAIN_DOMAIN)) {
      domains.push(process.env.NEXT_PUBLIC_MAIN_DOMAIN)
    }
  }
  
  return domains
}

/**
 * 获取主域名（从当前请求提取）
 */
function extractMainDomain(hostname: string): string {
  const parts = hostname.split('.')
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return hostname
  }
  
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname
  }
  
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`
  }
  
  return hostname
}

/**
 * 标准化域名（确保带点前缀）
 */
function normalizeDomain(domain: string): string {
  return domain.startsWith('.') ? domain : `.${domain}`
}

/**
 * 检查域名是否匹配
 */
function isDomainMatch(hostname: string, mainDomain: string): boolean {
  const normalizedMainDomain = normalizeDomain(mainDomain)
  const currentMainDomain = extractMainDomain(hostname)
  
  if (currentMainDomain === normalizedMainDomain) {
    return true
  }
  
  // 也检查不带点的前缀
  const mainDomainWithoutDot = normalizedMainDomain.replace(/^\./, '')
  return hostname.endsWith(mainDomainWithoutDot)
}

/**
 * 获取当前域名对应的主域名（如果匹配配置）
 */
function getMatchedMainDomain(hostname: string): string | null {
  const mainDomains = getMainDomains()
  
  if (mainDomains.length === 0) {
    return null
  }
  
  for (const domain of mainDomains) {
    if (isDomainMatch(hostname, domain)) {
      return normalizeDomain(domain)
    }
  }
  
  return null
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

    console.log('[登录] Supabase 配置检查:', {
      supabaseUrl: supabaseUrl ? '已设置' : '未设置',
      supabaseUrlValue: supabaseUrl,
      supabaseAnonKey: supabaseAnonKey ? '已设置' : '未设置',
      allEnvKeys: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        COZE_SUPABASE_URL: process.env.COZE_SUPABASE_URL,
        SUPABASE_URL: process.env.SUPABASE_URL,
      }
    })

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误' },
        { status: 500 }
      )
    }

    // 获取请求的主机信息
    const requestHostname = request.headers.get('host')?.split(':')[0] || 'localhost'
    const matchedMainDomain = getMatchedMainDomain(requestHostname)
    const configuredMainDomains = getMainDomains()

    // 如果没有匹配到配置的主域名，自动计算当前请求的主域名
    let cookieDomain = matchedMainDomain
    if (!matchedMainDomain && requestHostname !== 'localhost') {
      // 自动从请求域名提取主域名（如 xxx.dev.coze.site -> .dev.coze.site）
      const parts = requestHostname.split('.')
      if (parts.length >= 3) {
        cookieDomain = `.${parts.slice(-3).join('.')}`
      } else if (parts.length === 2) {
        cookieDomain = `.${requestHostname}`
      }
    }

    console.log('[登录] 主域名配置:', {
      requestHostname,
      matchedMainDomain,
      configuredMainDomains,
      cookieDomain,
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

    // 构建响应
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
        mainDomain: cookieDomain,
        mainDomains: configuredMainDomains,
      },
    })

    // 设置 Supabase SSR 所需的 cookie
    if (authData.session) {
      const { access_token, refresh_token } = authData.session
      const isProduction = process.env.NODE_ENV === 'production'
      const cookieMaxAge = 60 * 60 * 24 * 7 // 7 天

      // 设置 cookie 的域名
      const setCookieDomain = (domain: string | null | undefined) => {
        // localhost 或没有域名时不设置 domain
        if (domain === 'localhost' || !domain) {
          return undefined
        }
        return domain
      }

      // 设置访问令牌 cookie
      response.cookies.set('sb-access-token', access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
        domain: setCookieDomain(cookieDomain),
      })

      // 设置刷新令牌 cookie
      response.cookies.set('sb-refresh-token', refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
        domain: setCookieDomain(cookieDomain),
      })

      // 设置 auth_token cookie（用于自定义认证逻辑）
      response.cookies.set('auth_token', access_token, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: cookieMaxAge,
        path: '/',
        domain: setCookieDomain(cookieDomain),
      })

      console.log('[登录] Cookie 已设置域名:', cookieDomain || '当前域名')
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
