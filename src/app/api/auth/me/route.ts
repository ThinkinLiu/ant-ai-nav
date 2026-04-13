import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 从多个来源获取 token
 * 优先级：Authorization header > token（当前域名）> auth_token（主域名/跨域）
 */
function getToken(request: NextRequest): string | null {
  // 1. 优先从 Authorization header 获取
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // 2. 从 cookie 获取
  const cookies = request.cookies.getAll()
  
  // 2.1 token（当前域名，自定义 JWT）
  const legacyToken = cookies.find(c => c.name === 'token')
  if (legacyToken?.value) {
    return legacyToken.value
  }
  
  // 2.2 auth_token（主域名，跨域共享）
  const authCookie = cookies.find(c => c.name === 'auth_token')
  if (authCookie?.value) {
    return authCookie.value
  }
  
  return null
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request)
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    // 获取 Supabase 配置（支持 NEXT_PUBLIC_ 和 COZE_ 前缀）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误' },
        { status: 500 }
      )
    }

    // 使用 JWT 直接验证
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: { user }, error: authError } = await client.auth.getUser(token)

    if (authError || !user) {
      console.error('[/api/auth/me] Token 验证失败:', authError?.message)
      
      // 判断是否为 token 过期
      const isExpired = authError?.message?.includes('expired') || 
                        authError?.message?.includes('Invalid JWT') ||
                        authError?.message?.includes('Signature has expired')
      
      if (isExpired) {
        return NextResponse.json(
          { success: false, error: '登录状态已过期，请重新登录', code: 'TOKEN_EXPIRED' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 获取用户详细信息
    const dbClient = getSupabaseClient(token)
    const { data: userData } = await dbClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      data: userData || {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        role: 'user',
      },
    })
  } catch (error) {
    console.error('[/api/auth/me] Error:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
