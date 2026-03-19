import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'
import { verifyAdmin } from '@/lib/auth'

// 获取短信配置
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

    // 获取短信配置
    const { data: settings, error } = await client
      .from('sms_settings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 返回配置（隐藏密钥）
    const safeSettings = (settings || []).map(s => ({
      ...s,
      access_key_secret: s.access_key_secret ? '******' : ''
    }))

    return NextResponse.json({
      success: true,
      data: safeSettings,
    })
  } catch (error) {
    console.error('获取短信配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新短信配置
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
    const { provider, access_key_id, access_key_secret, sign_name, template_code, is_enabled, api_url, extra_config } = body

    if (!provider) {
      return NextResponse.json(
        { success: false, error: '请选择服务商' },
        { status: 400 }
      )
    }

    // 获取现有配置
    const { data: existingSettings } = await client
      .from('sms_settings')
      .select('*')
      .eq('provider', provider)
      .single()

    let result
    if (existingSettings) {
      // 更新现有配置
      const updateData: Record<string, any> = {
        access_key_id,
        sign_name,
        template_code,
        is_enabled: is_enabled ?? false,
        api_url,
        extra_config,
        updated_at: new Date().toISOString(),
      }
      
      // 只有在新密钥不是占位符时才更新密钥
      if (access_key_secret && access_key_secret !== '******') {
        updateData.access_key_secret = access_key_secret
      }

      const { data, error } = await client
        .from('sms_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // 创建新配置
      const { data, error } = await client
        .from('sms_settings')
        .insert({
          provider,
          access_key_id,
          access_key_secret: access_key_secret || '',
          sign_name,
          template_code,
          is_enabled: is_enabled ?? false,
          api_url,
          extra_config,
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
      message: '短信配置保存成功',
      data: {
        ...result.data,
        access_key_secret: '******'
      },
    })
  } catch (error) {
    console.error('保存短信配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
