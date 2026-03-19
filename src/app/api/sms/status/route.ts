import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取短信登录是否启用（公开接口）
export async function GET() {
  try {
    const client = getSupabaseClient()

    // 检查是否有已启用的短信配置
    const { data: settings, error } = await client
      .from('sms_settings')
      .select('provider, is_enabled')
      .eq('is_enabled', true)
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: true,
        enabled: false,
      })
    }

    return NextResponse.json({
      success: true,
      enabled: settings && settings.length > 0,
    })
  } catch (error) {
    console.error('检查短信配置错误:', error)
    return NextResponse.json({
      success: true,
      enabled: false,
    })
  }
}
