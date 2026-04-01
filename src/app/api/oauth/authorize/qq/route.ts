import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// QQ登录授权
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const redirectUri = searchParams.get('redirect_uri')
    const state = searchParams.get('state') || '/'

    // 获取QQ OAuth配置
    const client = getSupabaseClient()
    const { data: settings, error } = await client
      .from('oauth_settings')
      .select('*')
      .eq('provider', 'qq')
      .eq('is_enabled', true)
      .single()

    if (error || !settings) {
      return NextResponse.redirect(
        new URL('/login?error=QQ登录未启用', request.url)
      )
    }

    // 构建QQ授权URL
    const appId = settings.app_id
    const baseUrl = process.env.COZE_PROJECT_DOMAIN_DEFAULT || request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const finalRedirectUri = redirectUri || `${protocol}://${baseUrl}/api/oauth/callback/qq`
    
    // QQ互联授权URL
    const qqAuthUrl = new URL('https://graph.qq.com/oauth2.0/authorize')
    qqAuthUrl.searchParams.set('client_id', appId)
    qqAuthUrl.searchParams.set('redirect_uri', finalRedirectUri)
    qqAuthUrl.searchParams.set('response_type', 'code')
    qqAuthUrl.searchParams.set('scope', 'get_user_info')
    qqAuthUrl.searchParams.set('state', state)
    
    return NextResponse.redirect(qqAuthUrl.toString())
  } catch (error) {
    console.error('QQ登录授权失败:', error)
    return NextResponse.redirect(
      new URL('/login?error=QQ登录失败', request.url)
    )
  }
}
