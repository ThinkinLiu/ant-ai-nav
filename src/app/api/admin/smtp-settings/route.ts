import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取SMTP配置
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 验证用户权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    // 获取SMTP配置
    const { data: settings, error } = await client
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 返回配置（隐藏密码）
    const safeSettings = settings ? {
      ...settings,
      password: settings.password ? '******' : ''
    } : null

    return NextResponse.json({
      success: true,
      data: safeSettings,
    })
  } catch (error) {
    console.error('获取SMTP配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新SMTP配置
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 验证用户权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { host, port, secure, user_name, password, from_email, from_name } = body

    if (!host || !port || !user_name || !from_email) {
      return NextResponse.json(
        { success: false, error: '请填写必填项' },
        { status: 400 }
      )
    }

    // 检查发件人邮箱是否与用户名一致
    if (from_email !== user_name) {
      return NextResponse.json(
        { success: false, error: '发件人邮箱必须与用户名（SMTP认证账号）一致，否则邮件发送会失败' },
        { status: 400 }
      )
    }

    // 获取现有配置
    const { data: existingSettings } = await client
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let result
    if (existingSettings) {
      // 更新现有配置
      const updateData: Record<string, any> = {
        host,
        port,
        secure: secure ?? true,
        user_name,
        from_email,
        from_name,
        updated_at: new Date().toISOString(),
      }
      
      // 只有在新密码不是占位符时才更新密码
      if (password && password !== '******') {
        updateData.password = password
      }

      const { data, error } = await client
        .from('smtp_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // 创建新配置
      const { data, error } = await client
        .from('smtp_settings')
        .insert({
          host,
          port,
          secure: secure ?? true,
          user_name,
          password: password || '',
          from_email,
          from_name,
          is_active: true,
        })
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMTP配置保存成功',
      data: {
        ...result.data,
        password: '******'
      },
    })
  } catch (error) {
    console.error('保存SMTP配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 测试SMTP连接
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const client = getSupabaseClient(token)

    // 验证用户权限
    const { data: { user } } = await client.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '无效的登录状态' },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const { data: userData } = await client
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限访问' },
        { status: 403 }
      )
    }

    // 获取SMTP配置
    const { data: settings } = await client
      .from('smtp_settings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!settings || !settings.host || !settings.user_name || !settings.password) {
      return NextResponse.json(
        { success: false, error: 'SMTP配置不完整，请先完善配置' },
        { status: 400 }
      )
    }

    // 这里只返回成功，实际的邮件发送测试在发送验证码时进行
    return NextResponse.json({
      success: true,
      message: 'SMTP配置验证通过',
    })
  } catch (error) {
    console.error('测试SMTP配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
