import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

export async function POST(request: NextRequest) {
  try {
    // 获取 token
    let token: string | null = null
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    // 如果有 token，调用 Supabase signOut
    if (token) {
      const client = getSupabaseClient(token)
      await client.auth.signOut()
    }

    // 构建响应
    const response = NextResponse.json({
      success: true,
      message: '已退出登录',
    })

    // 清除 Cookie（设置过期时间为 0）
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // 立即过期
    }

    // 清除所有认证相关 Cookie
    response.cookies.set('auth_token', '', cookieOptions)
    response.cookies.set('sb-access-token', '', cookieOptions)
    response.cookies.set('sb-refresh-token', '', cookieOptions)
    
    // 尝试清除可能设置在不同域名的 Cookie
    const requestHostname = request.headers.get('host')?.split(':')[0] || 'localhost'
    if (requestHostname !== 'localhost' && !requestHostname.startsWith('127.')) {
      // 获取主域名
      const parts = requestHostname.split('.')
      let mainDomain: string | undefined
      if (parts.length >= 2) {
        mainDomain = `.${parts.slice(-2).join('.')}`
      }
      
      if (mainDomain) {
        response.cookies.set('auth_token', '', { ...cookieOptions, domain: mainDomain })
        response.cookies.set('sb-access-token', '', { ...cookieOptions, domain: mainDomain })
        response.cookies.set('sb-refresh-token', '', { ...cookieOptions, domain: mainDomain })
      }
    }

    return response
  } catch (error) {
    console.error('退出登录错误:', error)
    // 即使出错也返回成功，避免前端状态异常
    return NextResponse.json({
      success: true,
      message: '已退出登录',
    })
  }
}
