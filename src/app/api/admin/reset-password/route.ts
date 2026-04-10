import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEnvWithFallback } from '@/lib/env-config'

/**
 * 重置管理员密码的临时 API
 * 仅用于紧急恢复访问权限
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword, adminSecret } = body

    // 简单的密钥验证（生产环境应该使用更安全的方式）
    const expectedSecret = process.env.ADMIN_RESET_SECRET || 'admin-reset-secret-key'
    
    if (adminSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: '邮箱和新密码不能为空' },
        { status: 400 }
      )
    }

    // 密码强度检查
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码至少需要6个字符' },
        { status: 400 }
      )
    }

    // 获取 Supabase Admin Key（自动跳过占位符）
    const supabaseUrl = getEnvWithFallback([
      'COZE_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_URL',
    ])
    const supabaseServiceKey = getEnvWithFallback([
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_ADMIN_KEY',
      'COZE_SUPABASE_ANON_KEY',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ])

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: '服务器配置错误' },
        { status: 500 }
      )
    }

    // 创建 Admin 客户端
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // 更新用户密码
    // 注意：Admin API 可以直接更新密码，不需要验证旧密码
    const { data, error } = await supabaseAdmin.auth.admin.updateUserByEmail(
      email,
      { password: newPassword }
    )

    if (error) {
      console.error('重置密码失败:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '密码重置成功',
      data: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch (error: any) {
    console.error('重置密码异常:', error)
    return NextResponse.json(
      { success: false, error: error.message || '服务器错误' },
      { status: 500 }
    )
  }
}
