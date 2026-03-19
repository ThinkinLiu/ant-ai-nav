import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

// 获取已启用的OAuth登录方式（公开接口）
export async function GET() {
  try {
    const client = getSupabaseClient()

    // 获取已启用的OAuth配置
    const { data: settings, error } = await client
      .from('oauth_settings')
      .select('provider, is_enabled')
      .eq('is_enabled', true)

    if (error) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // 只返回已启用的提供商
    const enabledProviders = (settings || [])
      .filter(s => s.is_enabled)
      .map(s => s.provider)

    return NextResponse.json({
      success: true,
      data: enabledProviders,
    })
  } catch (error) {
    console.error('获取OAuth配置错误:', error)
    return NextResponse.json({
      success: true,
      data: [],
    })
  }
}
