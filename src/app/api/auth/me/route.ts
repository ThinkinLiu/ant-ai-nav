import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // 获取 Supabase 配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.COZE_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误' },
        { status: 500 }
      )
    }

    // 使用正确的 token 验证方式
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 直接使用 JWT 验证用户
    const { data: { user }, error: authError } = await client.auth.getUser(token)

    if (authError || !user) {
      console.error('[/api/auth/me] Token 验证失败:', authError?.message)
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
