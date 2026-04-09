import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/storage/database/supabase-client'

/**
 * 获取跨域配置（公开接口）
 */
export async function GET() {
  try {
    const client = getSupabaseClient()

    const { data, error } = await client
      .from('cross_domain_config')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: data?.enabled || false,
        mainDomains: data?.main_domains || [], // 支持多个主域名
        sharedDomains: data?.shared_domains || [],
        authSyncTimeout: data?.auth_sync_timeout || 5000,
      },
    })
  } catch (error) {
    console.error('获取跨域配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

/**
 * 更新跨域配置（仅管理员）
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled, mainDomain, mainDomains, sharedDomains, authSyncTimeout } = body

    const client = getSupabaseClient()

    // 合并多个主域名配置
    let domainsToSave = mainDomains || []
    if (mainDomain && !domainsToSave.includes(mainDomain)) {
      domainsToSave.push(mainDomain)
    }

    // 清理域名格式（确保带点前缀）
    domainsToSave = domainsToSave
      .map((d: string) => d.trim())
      .filter(Boolean)
      .map((d: string) => d.startsWith('.') ? d : `.${d}`)

    const { data, error } = await client
      .from('cross_domain_config')
      .update({
        enabled: enabled ?? false,
        main_domains: domainsToSave, // 多个主域名
        shared_domains: sharedDomains || [],
        auth_sync_timeout: authSyncTimeout || 5000,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        enabled: data?.enabled || false,
        mainDomains: data?.main_domains || [],
        sharedDomains: data?.shared_domains || [],
        authSyncTimeout: data?.auth_sync_timeout || 5000,
      },
    })
  } catch (error) {
    console.error('更新跨域配置错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
