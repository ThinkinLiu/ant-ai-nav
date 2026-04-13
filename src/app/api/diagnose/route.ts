import { NextResponse } from 'next/server'
import { isPlaceholderUrl, isPlaceholderKey } from '@/lib/env-config'

/**
 * 诊断接口 - 检查环境变量配置状态
 * 统一使用 NEXT_PUBLIC_ 前缀
 */
export async function GET() {
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已设置' : '未设置',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
    NODE_ENV: process.env.NODE_ENV,
    COZE_WORKSPACE_PATH: process.env.COZE_WORKSPACE_PATH ? '已设置' : '未设置',
  }

  // 检查是否为有效 URL
  const checkUrl = (url: string | undefined) => {
    if (!url) return '空'
    if (isPlaceholderUrl(url)) return '占位符'
    return '有效值: ' + url.substring(0, 50) + '...'
  }

  // 检查是否为有效 KEY
  const checkKey = (key: string | undefined) => {
    if (!key) return '空'
    if (isPlaceholderKey(key)) return '占位符'
    return '有效值: ' + key.substring(0, 20) + '...'
  }

  const urlStatus = {
    NEXT_PUBLIC_SUPABASE_URL: checkUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  }

  const keyStatus = {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: checkKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  }

  return NextResponse.json({
    success: true,
    data: {
      envStatus,
      urlStatus,
      keyStatus,
      timestamp: new Date().toISOString(),
    },
  })
}
