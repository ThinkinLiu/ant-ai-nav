import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { randomUUID } from 'crypto'

/**
 * 获取主域名配置
 */
function getMainDomain(hostname: string): string {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_MAIN_DOMAIN) {
    return process.env.NEXT_PUBLIC_MAIN_DOMAIN
  }
  
  // 从 hostname 提取主域名
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

// QQ登录回调
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') || '/'
    
    if (!code) {
      return NextResponse.redirect(
        new URL('/login?error=授权失败', request.url)
      )
    }

    // 获取请求的主机信息
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || request.headers.get('host')?.split(':')[0] || 'localhost'
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const hostname = baseUrl.split(':')[0]
    const mainDomain = getMainDomain(hostname)
    const isProduction = process.env.NODE_ENV === 'production'

    // 获取 Supabase 配置（支持 NEXT_PUBLIC_ 和 COZE_ 前缀）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/login?error=服务器配置错误', request.url)
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

    // 获取QQ OAuth配置
    const { data: settings, error: settingsError } = await supabase
      .from('oauth_settings')
      .select('*')
      .eq('provider', 'qq')
      .eq('is_enabled', true)
      .single()

    if (settingsError || !settings) {
      return NextResponse.redirect(
        new URL('/login?error=QQ登录未配置', request.url)
      )
    }

    // 获取访问令牌
    const redirectUri = `${protocol}://${baseUrl}/api/oauth/callback/qq`
    
    const tokenUrl = new URL('https://graph.qq.com/oauth2.0/token')
    tokenUrl.searchParams.set('grant_type', 'authorization_code')
    tokenUrl.searchParams.set('client_id', settings.app_id)
    tokenUrl.searchParams.set('client_secret', settings.app_secret)
    tokenUrl.searchParams.set('code', code)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)

    const tokenResponse = await fetch(tokenUrl.toString())
    const tokenText = await tokenResponse.text()
    
    // QQ返回的是query string格式
    const tokenParams = new URLSearchParams(tokenText)
    const accessToken = tokenParams.get('access_token')

    if (!accessToken) {
      console.error('获取QQ访问令牌失败:', tokenText)
      return NextResponse.redirect(
        new URL('/login?error=QQ授权失败', request.url)
      )
    }

    // 获取OpenID
    const openIdUrl = new URL('https://graph.qq.com/oauth2.0/me')
    openIdUrl.searchParams.set('access_token', accessToken)

    const openIdResponse = await fetch(openIdUrl.toString())
    const openIdText = await openIdResponse.text()
    
    // 解析JSONP格式的响应
    const openIdMatch = openIdText.match(/callback\(\s*(\{.*\})\s*\)/)
    if (!openIdMatch) {
      console.error('解析QQ OpenID失败:', openIdText)
      return NextResponse.redirect(
        new URL('/login?error=QQ授权失败', request.url)
      )
    }
    
    const openIdData = JSON.parse(openIdMatch[1])
    const openid = openIdData.openid

    if (!openid) {
      console.error('获取QQ OpenID失败:', openIdData)
      return NextResponse.redirect(
        new URL('/login?error=QQ授权失败', request.url)
      )
    }

    // 获取用户信息
    const userInfoUrl = new URL('https://graph.qq.com/user/get_user_info')
    userInfoUrl.searchParams.set('access_token', accessToken)
    userInfoUrl.searchParams.set('oauth_consumer_key', settings.app_id)
    userInfoUrl.searchParams.set('openid', openid)

    const userInfoResponse = await fetch(userInfoUrl.toString())
    const userInfo = await userInfoResponse.json()

    // 使用 openid 作为唯一标识
    const providerUserId = openid

    // 查找是否已绑定账号
    const { data: existingAccount } = await supabase
      .from('user_oauth_accounts')
      .select('user_id')
      .eq('provider', 'qq')
      .eq('provider_user_id', providerUserId)
      .single()

    let userId: string

    if (existingAccount) {
      // 已绑定，直接登录
      userId = existingAccount.user_id
    } else {
      // 未绑定，创建新用户
      userId = randomUUID()
      
      // 创建用户
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: `qq_${providerUserId}@placeholder.local`,
          name: userInfo.nickname || 'QQ用户',
          avatar: userInfo.figureurl_qq_2 || userInfo.figureurl_qq_1 || userInfo.figureurl,
          role: 'user',
          is_active: true,
        })

      if (createUserError) {
        console.error('创建用户失败:', createUserError)
        return NextResponse.redirect(
          new URL('/login?error=创建用户失败', request.url)
        )
      }

      // 创建OAuth账号绑定
      await supabase
        .from('user_oauth_accounts')
        .insert({
          user_id: userId,
          provider: 'qq',
          provider_user_id: providerUserId,
          provider_data: userInfo,
        })
    }

    // 更新最后登录时间
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)

    // 获取用户信息用于生成token
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // 生成登录token（使用JWT格式）
    const sessionToken = Buffer.from(JSON.stringify({
      userId,
      email: userData?.email,
      name: userData?.name,
      role: userData?.role,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天
    })).toString('base64')

    // 构建重定向URL
    let redirectUrl: URL
    if (state.startsWith('http://') || state.startsWith('https://')) {
      redirectUrl = new URL(state)
    } else {
      redirectUrl = new URL(state, `${protocol}://${baseUrl}`)
    }

    redirectUrl.searchParams.set('token', sessionToken)
    redirectUrl.searchParams.set('userId', userId)
    redirectUrl.searchParams.set('oauth', 'qq')
    
    // 设置 cookie
    const cookieMaxAge = 30 * 24 * 60 * 60 // 30天
    const cookieDomain = mainDomain !== 'localhost' && mainDomain !== hostname ? mainDomain : undefined

    console.log('[QQ登录] 设置Cookie:', {
      mainDomain,
      hostname,
      cookieDomain,
      isProduction,
    })

    const response = NextResponse.redirect(redirectUrl)

    // 设置 auth_token（主要token）
    response.cookies.set('auth_token', sessionToken, {
      httpOnly: false, // 前端需要读取
      secure: isProduction,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
      domain: cookieDomain,
    })

    // 设置 sb-access-token（用于 Supabase SSR middleware）
    response.cookies.set('sb-access-token', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
      domain: cookieDomain,
    })

    // 设置 sb-refresh-token
    response.cookies.set('sb-refresh-token', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
      domain: cookieDomain,
    })

    // 设置旧的 token cookie（兼容）
    response.cookies.set('token', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
      domain: cookieDomain,
    })
    
    return response
  } catch (error) {
    console.error('QQ登录回调失败:', error)
    return NextResponse.redirect(
      new URL('/login?error=QQ登录失败', request.url)
    )
  }
}

/**
 * 获取环境变量（从多个可能的名称中获取）
 */
function getEnv(names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (value) return value
  }
  return undefined
}
