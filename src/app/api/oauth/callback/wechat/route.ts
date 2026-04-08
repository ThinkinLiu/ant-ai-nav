import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { randomUUID } from 'crypto'

// 微信登录回调
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

    // 获取微信OAuth配置
    const client = getSupabaseClient()
    const { data: settings, error: settingsError } = await client
      .from('oauth_settings')
      .select('*')
      .eq('provider', 'wechat')
      .eq('is_enabled', true)
      .single()

    if (settingsError || !settings) {
      return NextResponse.redirect(
        new URL('/login?error=微信登录未配置', request.url)
      )
    }

    // 获取访问令牌
    const tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token')
    tokenUrl.searchParams.set('appid', settings.app_id)
    tokenUrl.searchParams.set('secret', settings.app_secret)
    tokenUrl.searchParams.set('code', code)
    tokenUrl.searchParams.set('grant_type', 'authorization_code')

    const tokenResponse = await fetch(tokenUrl.toString())
    const tokenData = await tokenResponse.json()

    if (tokenData.errcode) {
      console.error('获取微信访问令牌失败:', tokenData)
      return NextResponse.redirect(
        new URL('/login?error=微信授权失败', request.url)
      )
    }

    const { access_token, openid, unionid } = tokenData

    // 获取用户信息
    const userInfoUrl = new URL('https://api.weixin.qq.com/sns/userinfo')
    userInfoUrl.searchParams.set('access_token', access_token)
    userInfoUrl.searchParams.set('openid', openid)

    const userInfoResponse = await fetch(userInfoUrl.toString())
    const userInfo = await userInfoResponse.json()

    // 使用 openid 或 unionid 作为唯一标识
    const providerUserId = unionid || openid

    // 查找是否已绑定账号
    const { data: existingAccount } = await client
      .from('user_oauth_accounts')
      .select('user_id')
      .eq('provider', 'wechat')
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
      const { error: createUserError } = await client
        .from('users')
        .insert({
          id: userId,
          email: `wechat_${providerUserId}@placeholder.local`,
          name: userInfo.nickname || '微信用户',
          avatar: userInfo.headimgurl,
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
      await client
        .from('user_oauth_accounts')
        .insert({
          user_id: userId,
          provider: 'wechat',
          provider_user_id: providerUserId,
          provider_data: userInfo,
        })
    }

    // 更新最后登录时间
    await client
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)

    // 获取用户信息用于生成token
    const { data: userData } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // 生成登录token（使用Supabase Auth）
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: userData?.email || '',
      password: 'oauth_placeholder_password',
    })

    // 由于OAuth用户没有真实密码，我们需要手动创建session
    // 这里使用一个简单的方式：创建一个临时的session token
    const sessionToken = Buffer.from(JSON.stringify({
      userId,
      email: userData?.email,
      name: userData?.name,
      role: userData?.role,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天
    })).toString('base64')

    // 重定向到前端，携带token
    // 使用环境变量中的正确域名，而不是使用 request.url 中的地址
    const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = `${protocol}://${domain}`

    // 构建正确的重定向URL
    let redirectUrl: URL
    if (state.startsWith('http://') || state.startsWith('https://')) {
      // 如果state已经是完整URL，直接使用
      redirectUrl = new URL(state)
    } else {
      // 如果state是相对路径，基于正确的域名构建
      redirectUrl = new URL(state, baseUrl)
    }

    redirectUrl.searchParams.set('token', sessionToken)
    redirectUrl.searchParams.set('userId', userId)
    
    // 设置cookie并重定向
    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set('token', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('微信登录回调失败:', error)
    return NextResponse.redirect(
      new URL('/login?error=微信登录失败', request.url)
    )
  }
}
