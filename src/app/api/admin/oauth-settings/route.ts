import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { verifyAdmin } from '@/lib/auth'

// 获取OAuth配置
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const client = getSupabaseClient()

    // 获取OAuth配置
    const { data: settings, error } = await client
      .from('oauth_settings')
      .select('*')
      .order('provider', { ascending: true })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 返回配置（隐藏密钥）
    const safeSettings = (settings || []).map(s => ({
      ...s,
      app_secret: s.app_secret ? '******' : ''
    }))

    return NextResponse.json({
      success: true,
      data: safeSettings,
    })
  } catch (error) {
    console.error('获取OAuth配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新OAuth配置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAdmin(request)
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      )
    }

    const client = getSupabaseClient()

    const body = await request.json()
    const { provider, app_id, app_secret, is_enabled } = body

    if (!provider || !app_id) {
      return NextResponse.json(
        { success: false, error: '请填写必填项' },
        { status: 400 }
      )
    }

    if (!['wechat', 'qq'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: '不支持的登录方式' },
        { status: 400 }
      )
    }

    // 获取现有配置
    const { data: existingSettings } = await client
      .from('oauth_settings')
      .select('*')
      .eq('provider', provider)
      .single()

    let result
    if (existingSettings) {
      // 更新现有配置
      const updateData: Record<string, any> = {
        app_id,
        is_enabled: is_enabled ?? false,
        updated_at: new Date().toISOString(),
      }
      
      // 只有在新密钥不是占位符时才更新密钥
      if (app_secret && app_secret !== '******') {
        updateData.app_secret = app_secret
      }

      const { data, error } = await client
        .from('oauth_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // 创建新配置
      const { data, error } = await client
        .from('oauth_settings')
        .insert({
          provider,
          app_id,
          app_secret: app_secret || '',
          is_enabled: is_enabled ?? false,
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
      message: 'OAuth配置保存成功',
      data: {
        ...result.data,
        app_secret: '******'
      },
    })
  } catch (error) {
    console.error('保存OAuth配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
