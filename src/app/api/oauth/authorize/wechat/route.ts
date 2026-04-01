import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 微信登录授权
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirectUri = searchParams.get('redirect_uri')
    const state = searchParams.get('state') || '/'

    // 获取微信OAuth配置
    const client = getSupabaseClient()
    const { data: settings, error } = await client
      .from('oauth_settings')
      .select('*')
      .eq('provider', 'wechat')
      .eq('is_enabled', true)
      .single()

    if (error || !settings) {
      return NextResponse.redirect(
        new URL('/login?error=微信登录未启用', request.url)
      )
    }

    // 构建微信授权URL
    const appId = settings.app_id
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const finalRedirectUri = redirectUri || `${protocol}://${baseUrl}/api/oauth/callback/wechat`
    
    // 微信开放平台授权URL
    const wechatAuthUrl = new URL('https://open.weixin.qq.com/connect/qrconnect')
    wechatAuthUrl.searchParams.set('appid', appId)
    wechatAuthUrl.searchParams.set('redirect_uri', finalRedirectUri)
    wechatAuthUrl.searchParams.set('response_type', 'code')
    wechatAuthUrl.searchParams.set('scope', 'snsapi_login')
    wechatAuthUrl.searchParams.set('state', state)
    
    // 添加必要的hash
    const authUrl = wechatAuthUrl.toString() + '#wechat_redirect'
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('微信登录授权失败:', error)
    return NextResponse.redirect(
      new URL('/login?error=微信登录失败', request.url)
    )
  }
}
